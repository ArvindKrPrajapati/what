import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import Wall from '../../assets/a.jpg';
// const Wall = { uri: "https://res.cloudinary.com/shivraj-technology/image/upload/v1663360357/by308uvlwhmlqgupwqma.jpg" }
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
export default function Login({ navigation }) {
    const [isSigninInProgress, setIsSigninInProgress] = useState(false)
    const { setCurrentUser, theme } = useContext(AuthContext)
    useEffect(() => {
        GoogleSignin.configure();
    }, [])

    const signIn = async () => {
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
            navigation.replace("Home")
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
                navigation.replace("Home")

            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, }]}>
            <Image source={Wall} resizeMode="contain" style={styles.wall} />
            <Text
                style={{
                    color: theme.colors.textColor,
                    fontSize: 20,
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: 28,
                }}>
                Connect with People around the world from your sofa
            </Text>
            <TouchableOpacity onPress={signIn} disabled={isSigninInProgress} style={{ paddingHorizontal: 20, backgroundColor: "#333333", padding: 10, marginTop: 20, borderRadius: 5 }}>
                <Text style={{ color: "#efefef" }}>Sign In With Google</Text>
            </TouchableOpacity >
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 50,
    },
    wall: {
        width: '90%',
        height: '70%',
    },
});
