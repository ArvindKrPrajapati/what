import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../components/Header'
import { SPACING } from '../config/constants';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Home({ navigation }) {
    let { active, currentUser, theme } = useContext(AuthContext)
    const [roomId, setRoomId] = useState(active)
    useEffect(() => {
        console.log(roomId);
        setRoomId(active)
    }, [active])
    const leaveRoom = async () => {
        setRoomId("")
        await AsyncStorage.removeItem("roomId")
    }
    const joinRoom = () => {
        navigation.replace("CreateCall", { action: "join", user: currentUser, room: active })
    }

    const createCall = () => {
        const user = {
            ...currentUser,
            video: true,
            mic: true,
            owner: true,
        }
        navigation.replace("CreateCall", { action: "create", user })
    }

    return (
        <>
            <StatusBar backgroundColor={theme.colors.background} />
            <Header />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.btns}>
                    <TouchableOpacity disabled={roomId ? true : false} onPress={() => { navigation.navigate("JoinCall") }} style={[styles.btn, { backgroundColor: 'green', opacity: roomId ? 0.3 : 1 }]}>
                        <Icon name='call' size={20} color='#efefef' />
                        <Text style={styles.btnText}>Join Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={roomId ? true : false} onPress={createCall} style={[styles.btn, { opacity: roomId ? 0.3 : 1 }]}>
                        <Icon name='add' size={22} color='#efefef' />
                        <Text style={styles.btnText}>Create Call</Text>
                    </TouchableOpacity>
                </View>
                {
                    roomId && (
                        <View style={{ alignItems: "center", justifyContent: "space-between", padding: 15, flexDirection: "row", marginVertical: 40, borderRadius: 5 }}>
                            <View>
                                <Text style={{ color: theme.colors.textColor, fontSize: 16, fontWeight: "700" }}>Active Room</Text>
                                <Text style={{ color: theme.colors.textColor, fontSize: 16 }}>{active}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity onPress={joinRoom} style={[styles.smallBtn, { backgroundColor: 'green' }]}>
                                    <Icon name='call' color="#efefef" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={leaveRoom} style={[styles.smallBtn]}>
                                    <Icon name='close' color="#efefef" size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            </View>
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING
    },
    btns: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    btnText: {
        color: '#efefef',
        fontWeight: '600',
        marginLeft: 5
    },
    btn: {
        backgroundColor: 'dodgerblue',
        padding: 10,
        borderRadius: 15,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    smallBtn: {
        backgroundColor: "red",
        marginLeft: 10,
        borderRadius: 50,
        width: 42,
        aspectRatio: 1 / 1,
        alignItems: "center",
        justifyContent: "center"
    }
})