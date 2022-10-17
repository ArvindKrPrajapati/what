import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { SPACING } from '../config/constants'
import { AuthContext } from '../context/AuthContext'
import Icon from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
// import { Camera, useCameraDevices } from 'react-native-vision-camera'

var t;
export default function BeforeJoin({ route, navigation }) {
    const [roomId, setRoomId] = useState(route.params.room)
    const [mic, setMic] = useState(true)
    const [isSigninInProgress, setIsSigninInProgress] = useState(false)
    const [video, setVideo] = useState(true)
    const [front, setFront] = useState(true)
    const { currentUser, theme, setCurrentUser } = useContext(AuthContext)

    // const devices = useCameraDevices()
    // const device = front ? devices.front : devices.back

    const cameraRef = useRef(null)
    const switchCamera = () => {
        setFront(p => !p)
    }
    // const askCamerPermision = async () => {
    // const newCameraPermission = await Camera.requestCameraPermission()
    // if (newCameraPermission == "authorized") {
    //     setVideo(true)
    // } else {
    //     setVideo(false)
    // }
    // }
    // useEffect(() => {
    //     askCamerPermision()
    // }, [])
    const join = () => {
        if (roomId) {
            const user = {
                ...currentUser,
                video,
                mic,
                owner: false,
            }
            navigation.replace("CreateCall", { action: "join", user, room: roomId })
        }
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
        // <Text>hoo</Text>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={{ alignItems: "center" }}>
                <Text style={styles.room}>{roomId}</Text>
                {
                    video ? (
                        <View style={styles.videoContainer}>
                            {/* {
                                device && (
                                    <Camera
                                        style={StyleSheet.absoluteFill}
                                        device={device}
                                        isActive={true}
                                        ref={cameraRef}

                                    />
                                )
                            } */}

                        </View>
                    ) : (
                        <View style={[styles.videoContainer, { backgroundColor: "#202020" }]}>
                            <Image source={{ uri: currentUser?.image }} style={styles.bigDp} />
                        </View>
                    )
                }
                <View style={styles.btnContainer}>
                    <TouchableOpacity onPress={() => { setMic(!mic) }} style={[styles.btn, { borderColor: theme.colors.textColor, }]}>
                        <Icon name={mic ? 'mic' : "mic-off"} size={25} color={theme.colors.textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setVideo(!video) }} style={[styles.btn, { borderColor: theme.colors.textColor, }]}>
                        <Icon name={video ? 'videocam' : 'videocam-off'} size={25} color={theme.colors.textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={switchCamera} disabled={!video} style={[styles.btn, { borderColor: theme.colors.textColor, opacity: video ? 1 : 0.4 }]}>
                        <Icon name='camera' size={25} color={theme.colors.textColor} />
                    </TouchableOpacity>

                </View>
                <TouchableOpacity onPress={join} style={styles.joinBtn}>
                    <Text style={{ color: "#fff" }}>Join Now</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={signIn}>
                <View style={styles.me}>
                    <Image source={{ uri: currentUser?.image }} style={styles.dp} />
                    <View>
                        <Text style={{ color: theme.colors.textColor, fontSize: 15, fontWeight: "600" }}>{currentUser?.name}</Text>
                        <Text style={{ color: theme.colors.textColor }}>{currentUser?.email}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING,
        alignItems: "center",
        justifyContent: "space-between"
    },
    videoContainer: {
        width: 200,
        height: 280,
        backgroundColor: "black",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    btnContainer: {
        flexDirection: "row",
        marginVertical: 24,
        justifyContent: "space-evenly",
        width: 300
    },
    btn: {
        width: 50,
        aspectRatio: 1 / 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 100,
        borderWidth: 1
    },
    room: {
        marginVertical: 15,
        fontSize: 16
    },
    joinBtn: {
        backgroundColor: "green",
        padding: 10,
        paddingHorizontal: 30,
        marginTop: 10,
        borderRadius: 5
    },
    me: {
        flexDirection: "row",
        padding: 10,
        paddingHorizontal: 30,
        alignItems: "center"
    },
    dp: {
        width: 30,
        aspectRatio: 1 / 1,
        marginRight: 15,
        borderRadius: 50
    },
    bigDp: {
        width: 80,
        aspectRatio: 1 / 1,
        borderRadius: 100
    }

})