import { View, Text, StyleSheet, Image, TouchableHighlight, TouchableOpacity } from 'react-native'
import React, { useContext, useState } from 'react'
import { SPACING } from '../config/constants'
import { AuthContext } from '../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

export default function Profile({ navigation }) {
    const { currentUser, theme } = useContext(AuthContext)

    const [isSigninInProgress, setIsSigninInProgress] = useState(false)
    const { setCurrentUser } = useContext(AuthContext)

    const logout = async () => {
        AsyncStorage.clear()
        navigation.navigate("Login")
    }


    const signIn = async () => {
        GoogleSignin.configure();
        setIsSigninInProgress(true)
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const user = {
                id: userInfo.user.id,
                name: userInfo.user.name,
                email: userInfo.user.email,
                image: userInfo.user.photo,
            }
            setIsSigninInProgress(false)
            setCurrentUser(user)
            await AsyncStorage.setItem("currentUser", JSON.stringify(user))
            await GoogleSignin.signOut()
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
                console.log(error);
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, }]}>
            <>
                <View style={styles.imgContainer}>
                    <Image source={{ uri: currentUser?.image }} style={styles.dp} />
                    <View style={{ padding: 20 }}>
                        <Text style={[styles.name, { color: theme.colors.textColor, }]}>{currentUser?.name}</Text>
                        <Text style={[styles.name, { color: theme.colors.textColor, fontSize: 15, fontWeight: "400" }]}>{currentUser?.email}</Text>
                    </View>
                </View>
            </>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity disabled={isSigninInProgress} onPress={signIn} style={[styles.logoutBtn, { borderColor: theme.colors.textColor }]}>
                    <Text style={{ color: theme.colors.textColor }}>Switch Account</Text>
                </TouchableOpacity>
                <TouchableHighlight underlayColor="rgba(255,0,0,0.2)" style={styles.logoutBtn} onPress={logout}>
                    <Text style={{ color: "red" }}>Logout</Text>
                </TouchableHighlight>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING,
        justifyContent: "space-between"
    },
    imgContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {
        fontSize: 22,
        fontWeight: "500"
    },
    dp: {
        width: 70,
        aspectRatio: 1 / 1,
        borderRadius: 1000
    },
    logoutBtn: {
        alignSelf: 'center',
        borderColor: "red",
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
        paddingHorizontal: 35,
    }
})