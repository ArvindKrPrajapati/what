import { View, Text, Pressable, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { AuthContext } from '../context/AuthContext'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase-config'

export default function Menu({ setModalOpen, checkIsOwner, roomId, shareRoom }) {
    const { theme, setActiveRoom } = useContext(AuthContext)
    const navigation = useNavigation()
    const { navigate } = useNavigation()
    const goChat = () => {
        setModalOpen(p => !p)
        navigate("Chat", { roomId })
    }
    const askToDelete = async () => {
        Alert.alert("Exit App", "Do you want to end this call for All",
            [
                { text: 'End', onPress: deleteRoom, style: 'destructive' },
                { text: 'Cancel' },
            ]
        )
    }
    const deleteRoom = async () => {
        await AsyncStorage.removeItem("activeRoom")
        setActiveRoom({})
        setModalOpen(false)
        navigation.navigate("Home")
        await deleteDoc(doc(db, 'rooms', roomId))
    }
    return (
        <View style={styles.container}>
            <Pressable onPress={() => { setModalOpen(p => !p) }} style={{ height: "100%" }}></Pressable>
            <View style={[styles.menu, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity onPress={shareRoom} style={styles.btn}>
                    <Icon name='share' color={theme.colors.textColor} size={25} />
                    <Text style={{ color: theme.colors.textColor, marginHorizontal: 15 }}>Share Room</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goChat} style={styles.btn}>
                    <Icon name='chat' color={theme.colors.textColor} size={25} />
                    <Text style={{ color: theme.colors.textColor, marginHorizontal: 15 }}>Chat Room</Text>
                </TouchableOpacity>
                {
                    checkIsOwner() && (
                        <TouchableOpacity onPress={askToDelete} style={styles.btn}>
                            <Icon name='close' color="red" size={25} />
                            <Text style={{ color: "red", marginHorizontal: 15 }}>Close Room for All</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between"
    },
    menu: {
        paddingVertical: 15,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        position: "absolute",
        width: "100%",
        bottom: 0,
    },
    btn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        paddingHorizontal: 20
    },
})