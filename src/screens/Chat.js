import { View, KeyboardAvoidingView, Pressable, StatusBar, TextInput, StyleSheet, Text, Platform, TouchableWithoutFeedback, Button, Keyboard, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { SPACING } from '../config/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from "../config/firebase-config";
import { doc, collection, addDoc, setDoc, onSnapshot, updateDoc, serverTimestamp, getDoc, deleteField, deleteDoc } from "firebase/firestore";
import uuid from 'react-native-uuid';
import LinearGradient from 'react-native-linear-gradient';
var limit = 15
var skip = 0;
export default function Chat({ route }) {
    const [roomId, setRoomId] = useState(route.params.roomId)
    const [data, setData] = useState([])
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(true)
    const { theme, currentUser, darkModeEnabled } = useContext(AuthContext)
    const [loadingMore, setLoadingMore] = useState(false)
    const [dataEnd, setDataEnd] = useState(false)
    // temperory
    const [slicedData, setSlicedData] = useState([])
    useEffect(() => {
        var unsub = onSnapshot(doc(db, 'chatRoom', roomId), (doc) => {
            if (doc.exists()) {
                setData(Object.values(doc.data())?.sort((a, b) => b?.date - a?.date))
                setSlicedData(Object.values(doc.data())?.sort((a, b) => b?.date - a?.date)?.slice(skip, limit))
            }
            setLoading(false)
        });
        return () => {
            unsub()
        }
    }, [])
    const sendMessage = async () => {
        if (!msg) {
            return
        }
        try {
            const uid = uuid.v4()
            const chatMsg = {
                uid,
                text: msg,
                date: serverTimestamp(),
                ...currentUser
            }
            setMsg('')
            setData([chatMsg, ...data])
            const chatRef = doc(db, "chatRoom", roomId)
            const res = await getDoc(chatRef)
            if (!res.exists()) {
                await setDoc(chatRef, { chatMsg })
            } else {
                await updateDoc(chatRef, {
                    [uid]: chatMsg
                })
            }

        } catch (error) {
            console.log(error);
        }
    }

    const loadMore = async () => {
        if (!dataEnd) {
            if (!loadingMore) {
                setLoadingMore(true)
                if (data.length == slicedData.length) {
                    setDataEnd(true)
                } else {
                    setDataEnd(false)
                    skip = limit
                    limit = limit + skip
                    await setSlicedData([...slicedData, ...data.slice(skip, limit)]);
                    await setLoadingMore(false)
                }
            }
        } else {
            skip = 0
            limit = 15
            console.log("ends", data.length == slicedData.length);
        }
    }
    const renderItem = ({ item }) => (
        <View style={styles.msgBox}>
            <Text style={{ fontWeight: "bold", fontSize: 15, color: theme.colors.textColor }}>{item.name}</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textColor, flexWrap: 'wrap' }}>{item.text}</Text>
        </View>
    )
    return (
        <>
            <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} backgroundColor={theme?.colors.background} />
            <View style={[styles.inner, { backgroundColor: theme.colors.background }]}>
                {
                    loading ? (
                        <View style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}>
                            <ActivityIndicator size={30} color={theme.colors.textColor} />
                        </View>
                    ) : (
                        <FlatList
                            ListFooterComponent={() => {
                                if (loadingMore) {
                                    <ActivityIndicator color={theme.colors.textColor} size={30} style={{ padding: 10, alignSelf: "center" }} />
                                }
                                return null
                            }}
                            keyExtractor={(item, index) => index}
                            style={styles.messageContainer}
                            showsVerticalScrollIndicator={false}
                            inverted={true}
                            onEndReached={loadMore}
                            data={slicedData}
                            renderItem={renderItem}
                        />)
                }
                <LinearGradient
                    colors={[theme.colors.gradientColor1, theme.colors.gradientColor2, theme.colors.gradientColor3]}
                    style={styles.shadow}>
                    <View style={[styles.createMsg, { backgroundColor: theme.colors.background }]}>
                        <TextInput
                            placeholder='Type Your Message'
                            placeholderTextColor={theme.colors.textColor}
                            style={[styles.input, { color: theme.colors.textColor }]}
                            multiline={true}
                            value={msg}
                            onChangeText={(e) => { setMsg(e) }}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                            <Icon name="send" size={25} color={theme.colors.textColor} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </>
    )
}
const styles = StyleSheet.create({

    inner: {
        flex: 1,
        justifyContent: "space-between",
    },
    createMsg: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },
    shadow: {
        paddingTop: 1.2
    },
    input: {
        maxHeight: 120,
        flexWrap: 'wrap',
        flex: 1,
    },
    messageContainer: {
        padding: SPACING,
        paddingTop: 5,
    },
    msgBox: {
        marginVertical: 10
    },
    sendBtn: {
        padding: 10,
        alignSelf: "center"
    }
});