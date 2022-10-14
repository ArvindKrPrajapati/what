import { View, Text } from 'react-native'
import React, { useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/AuthContext'

export default function Splash({ navigation }) {
    const { theme } = useContext(AuthContext)
    const getCurrentUser = async () => {
        const user = await AsyncStorage.getItem("currentUser")
        const u = JSON.parse(user)
        setTimeout(() => {
            if (u?.id) {
                navigation.replace("Home")
            } else {
                navigation.replace("Login")
            }
        }, 2500);
    }
    useEffect(() => {
        getCurrentUser()
    }, [])
    return (
        <View style={{ flex: 1, backgroundColor: theme?.colors.background, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme?.colors.textColor, fontSize: 50, fontWeight: "900" }}>What!</Text>
        </View>
    )
}