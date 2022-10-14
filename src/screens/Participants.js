import { View, Text, StyleSheet, TextInput, FlatList, TouchableHighlight, StatusBar, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { SPACING } from '../config/constants'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../config/firebase-config'
import { AuthContext } from '../context/AuthContext'
var data;
export default function Participants({ route, navigation }) {
    const { theme } = useContext(AuthContext)
    const [participants, setParticipants] = useState(route.params.participants)
    data = route.params.participants;
    const [roomId, setRoomId] = useState(route.params.roomId)
    const [searchText, setSearchText] = useState('')
    useEffect(() => {
        if (roomId) {
            var unsub = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
                doc.exists() && setParticipants(Object.values(doc.data()))
            });
            return () => {
                unsub()
            }
        }
    }, [])

    const search = (text) => {
        setParticipants(data.filter((obj) => {
            if (obj?.name.toLowerCase().includes(text.toLowerCase())) {
                return obj
            }
        }));
    }
    const renderItem = ({ item }) => (
        <TouchableHighlight style={styles.btn}>
            <View style={styles.btnContainer}>
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <Image style={styles.dp} source={{ uri: item?.image }} />
                    <Text style={[styles.name, { color: theme.colors.textColor, }]}>{item?.name}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Icon name={item?.video ? "videocam" : "videocam-off"} color={theme.colors.textColor} size={22} />
                    <Icon name={item?.mic ? "mic" : "mic-off"} color={theme.colors.textColor} size={22} />
                </View>
            </View>
        </TouchableHighlight>
    )
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, }]}>
            <StatusBar backgroundColor={theme.colors.background} />
            <TextInput
                placeholder='Search Participants'
                placeholderTextColor={theme.colors.textColor}
                style={[styles.input, { borderColor: theme.colors.textColor, }]}
                // value={searchText}
                color={theme.colors.textColor}
                onChangeText={(e) => { search(e) }}
            />
            <FlatList
                keyExtractor={(item, i) => i}
                data={participants}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING
    },
    input: {
        borderRadius: 5,
        borderWidth: 1,
        padding: 4,
        paddingHorizontal: 20,
        marginBottom: 8
    },
    btn: {
        // backgroundColor: "r",

    },
    dp: {
        width: 35,
        aspectRatio: 1 / 1,
        borderRadius: 50
    },
    btnContainer: {
        flexDirection: "row",
        marginVertical: 5,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: "500",
        paddingHorizontal: 15
    }
})