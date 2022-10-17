import { View, Text, Pressable, TouchableOpacity, StyleSheet, Share } from 'react-native'
import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { AuthContext } from '../context/AuthContext'
import { useNavigation } from '@react-navigation/native'

export default function Menu({ setModalOpen, roomId }) {
    const { theme } = useContext(AuthContext)
    const navigation = useNavigation()
    const { navigate } = useNavigation()
    const goChat = () => {
        setModalOpen(p => !p)
        navigate("Chat", { roomId })
    }
    const shareRoom = async () => {
        try {
            const result = await Share.share({
                message:
                    'Join My Room on What! \n Room ID : ' + roomId,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
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