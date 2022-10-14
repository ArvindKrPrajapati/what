import { View, Text, StyleSheet, Animated, BackHandler, StatusBar, Share, Modal, Dimensions, TouchableOpacity, FlatList, TouchableHighlight, ActivityIndicator, AppState } from 'react-native'
import React, { useRef, useState, useEffect, useContext } from 'react'
import LinearGradient from "react-native-linear-gradient"
const { height } = Dimensions.get("window")
import HeaderControls from '../components/HeaderControls';
import BottomControls from '../components/BottomControls';
import { db } from "../config/firebase-config";
import { doc, collection, addDoc, onSnapshot, updateDoc, serverTimestamp, getDoc, deleteField, deleteDoc } from "firebase/firestore";
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { AuthContext } from '../context/AuthContext';
import Menu from '../components/Menu';
import UserCard from '../components/UserCard';
import PipHandler, { usePipModeListener } from 'react-native-pip-android';
export default function CreateCall({ navigation, route }) {
    const [inPipMode, setInPipMode] = useState(usePipModeListener())
    const { theme, setActiveRoom } = useContext(AuthContext)
    const [user, setUser] = useState(route.params.user);
    const [action, setAction] = useState(route.params.action);
    const [notFound, setNotFound] = useState(false)
    const [pushed, setPushed] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const topValue = useRef(new Animated.Value(0)).current;
    const bottomValue = useRef(new Animated.Value(0)).current;
    const myStreamBottomValue = useRef(new Animated.Value(110)).current;
    const [isMicMute, setIsMicMute] = useState(user.mic)
    const [isVideo, setIsVideo] = useState(user.video)
    const [roomId, setRoomId] = useState(route.params?.room);
    const [participants, setParticipants] = useState([])

    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)

    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();



    const startPip = () => {
        setInPipMode(true)
        PipHandler.enterPipMode(300, 214)
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            startPip
        );

        return () => backHandler.remove();
    }, []);


    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            console.log(nextAppState);
            if (nextAppState == "background") {
                startPip()
            }
            if (nextAppState == "active") {
                setInPipMode(false)
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);




    const join = async () => {
        try {
            const roomRef = doc(db, 'rooms', roomId);
            const isRoomExists = await getDoc(roomRef)
            if (isRoomExists.exists()) {
                const uid = uuid.v4()
                const data = { ...user, date: serverTimestamp(), uid }
                setUser(data)
                await updateDoc(roomRef, {
                    [uid]: data
                })
                setActiveRoom({ ...data, roomId })
                setAction("ok")
                await AsyncStorage.setItem("activeRoom", JSON.stringify({ ...data, roomId }))
            } else {
                setNotFound(true)
            }
            setLoading(false)
        } catch (error) {
            console.log(error);
        }
    }

    const createRoom = async () => {
        const uid = uuid.v4()
        const data = { ...user, date: serverTimestamp(), uid }
        setUser(data)
        try {
            const roomRef = collection(db, "rooms");
            const res = await addDoc(roomRef, {
                [uid]: data
            })
            setRoomId(res.id)
            setAction("ok")
            setActiveRoom({ ...data, roomId: res.id })
            await AsyncStorage.setItem("activeRoom", JSON.stringify({ ...data, roomId: res.id }))
            setLoading(false)
            setParticipants([data])
        } catch (error) {
            console.log(error);
        }
    }

    const rejoin = async () => {
        const { activeRoom } = route.params

        try {
            const roomRef = doc(db, 'rooms', roomId);
            const isRoomExists = await getDoc(roomRef)
            if (isRoomExists.exists()) {
                const uid = activeRoom?.uid
                const data = {
                    ...user,
                    date: serverTimestamp(),
                    uid: uid,
                    mic: activeRoom?.mic,
                    video: activeRoom.video,
                    owner: activeRoom.owner
                }
                setUser(data)
                await updateDoc(roomRef, {
                    [uid]: data
                })
                setActiveRoom({ ...data, roomId })
                setAction("ok")
                await AsyncStorage.setItem("activeRoom", JSON.stringify({ ...data, roomId }))
            } else {
                setNotFound(true)
            }
            setLoading(false)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        switch (action) {
            case "join":
                join()
                break;
            case "create":
                createRoom()
                break;
            case "rejoin":
                rejoin()
                break;
            case "ok":
                console.log("Already joined or created Room or rejoined")
                break;
            default:
                setNotFound(true)
                break;
        }
    }, [])

    useEffect(() => {
        if (roomId) {
            var unsub = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
                doc.exists() ? setParticipants(Object.values(doc.data())) : setNotFound(true)
            });
            return () => {
                unsub()
            }
        }
    }, [])

    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.timing(topValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.timing(bottomValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.timing(myStreamBottomValue, {
            toValue: 110,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.timing(topValue, {
            toValue: -100,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.timing(bottomValue, {
            toValue: -100,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.timing(myStreamBottomValue, {
            toValue: 20,
            duration: 300,
            delay: 200,
            useNativeDriver: false,
        }).start();
    };

    const pressing = () => {
        if (pushed) {
            fadeIn();
            setPushed(false);
        } else {
            fadeOut();
            setPushed(true);
        }
    };
    const handleLeave = async () => {
        try {
            await AsyncStorage.removeItem("activeRoom")
            setActiveRoom({})
            navigation.navigate("Home")
            if (roomId) {
                const roomRef = doc(db, 'rooms', roomId);
                await updateDoc(roomRef, {
                    [user.uid]: deleteField()
                })
            }

        } catch (error) {
            console.log(error);
        }
    }



    const toggleMic = async () => {
        setParticipants(current =>
            current.map(obj => {
                if (obj.uid === user.uid) {
                    return { ...obj, mic: !isMicMute };
                }
                return obj;
            }),
        );
        setUser({ ...user, mic: !user.mic })
        setIsMicMute(!isMicMute)
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
            [user.uid + ".mic"]: !isMicMute
        })

    }

    const toggleVideo = async () => {
        setParticipants(current =>
            current.map(obj => {
                if (obj.uid === user.uid) {
                    return { ...obj, video: !isVideo };
                }
                return obj;
            }),
        );
        setUser({ ...user, video: !user.video })
        setIsVideo(!isVideo)
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
            [user.uid + ".video"]: !isVideo
        })
    }

    const checkIsVideoTrue = () => {
        const a = participants.find((o) => o.uid == user.uid)
        return (a?.video);
    }
    const checkIsAudioTrue = () => {
        const a = participants.find((o) => o.uid == user.uid)
        return (a?.mic);
    }

    const checkIsOnwer = () => {
        const a = participants.find((o) => o.uid == user.uid)
        return (a?.owner);
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

    const renderItem = ({ item }) => (
        <UserCard
            item={item}
            participants={participants}
            inPipMode={inPipMode}
            user={user}
            shareRoom={shareRoom}
        />
    )
    const col = participants.length > 2 ? 2 : 0
    if (notFound) {
        return (
            <View style={[styles.container, { alignItems: 'center', backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.textColor, fontSize: 30, textAlign: 'center' }}>404 Not Found</Text>
            </View>
        )
    }

    // if pip mode

    if (inPipMode) {
        const item = participants[0]
        return renderItem({ item })
    }
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {
                pushed ?
                    <StatusBar backgroundColor={theme.colors.background} />
                    :
                    <StatusBar backgroundColor={theme.colors.gradientColor1} />
            }
            <Animated.View style={[styles.headerContainer, { top: topValue }]}>
                <LinearGradient
                    colors={[theme.colors.gradientColor1, theme.colors.gradientColor2, theme.colors.gradientColor3]}
                    style={styles.background}
                >
                    <HeaderControls />
                </LinearGradient>
            </Animated.View>
            {
                loading ?
                    <View style={{ alignItems: "center" }}>
                        <ActivityIndicator size={50} color={theme.colors.textColor} />
                        <TouchableOpacity onPress={handleLeave} style={{ padding: 8, borderRadius: 4, paddingHorizontal: 40, marginVertical: 14 }} >
                            <Text style={{ color: theme.colors.textColor }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    (<TouchableHighlight underlayColor={theme.colors.background} onPress={pressing} style={pushed ? [styles.fullPlayArea, { padding: participants.length > 1 ? 5 : 0 }] : [styles.playarea, { padding: participants.length > 1 ? 5 : 0 }]}>

                        <FlatList
                            keyExtractor={(item, i) => i}
                            contentContainerStyle={participants.length == 1 && { height: "100%" }}
                            data={participants.slice(0, 4)}
                            renderItem={renderItem}
                            numColumns={col}
                            key={col}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={() => {
                                if (participants.length > 4) {
                                    return (
                                        <TouchableOpacity onPress={() => { navigation.navigate("Participants", { participants, roomId }) }} style={{ marginVertical: 10, padding: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "center" }}>
                                                <Text style={{ color: theme.colors.textColor }}>{participants.length - 4} More Participants</Text>
                                                <Icon name='chevron-forward' size={25} color={theme.colors.textColor} />
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }
                                return null
                            }}
                        />


                    </TouchableHighlight>)
            }
            <Animated.View style={[styles.bottomContainer, { bottom: bottomValue }]}>
                <LinearGradient
                    colors={[theme.colors.gradientColor1, theme.colors.gradientColor2, theme.colors.gradientColor3]}
                    style={[styles.background, styles.bottomGradient]}
                >
                    <BottomControls
                        disabled={loading}
                        toggleMic={toggleMic}
                        toggleVideo={toggleVideo}
                        handleLeave={handleLeave}
                        video={checkIsVideoTrue}
                        mic={checkIsAudioTrue}
                        setModalOpen={setModalOpen}
                    />
                </LinearGradient>
            </Animated.View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalOpen}
                onRequestClose={() => {
                    setModalOpen(!modalOpen);
                }}
            >
                <Menu
                    setModalOpen={setModalOpen}
                    checkIsOwner={checkIsOnwer}
                    roomId={roomId}
                    shareRoom={shareRoom}
                />
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    background: {
        height: 70,
        position: 'absolute',
        top: 0,
        width: '100%'
    },
    headerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100,
    },
    bottomContainer: {
        height: 70,
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100,
    },
    bottomGradient: {
        height: 70,
        bottom: 0,
        transform: [{ rotate: '180deg' }],
    },
    playarea: {
        height: height - 140,
        margin: 12,
        borderRadius: 10,
        overflow: 'hidden'
    },
    fullPlayArea: {
        height: '100%',
    },
})