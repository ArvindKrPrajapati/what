import { View, Text, StyleSheet, Animated, StatusBar, Pressable, Modal, Dimensions, TouchableHighlight } from 'react-native'
import React, { useRef, useState, useEffect, useContext } from 'react'
import LinearGradient from "react-native-linear-gradient"
const { height } = Dimensions.get("window")
import HeaderControls from '../components/HeaderControls';
import BottomControls from '../components/BottomControls';
import { db } from "../config/firebase-config";
import { doc, collection, addDoc, onSnapshot, updateDoc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { AuthContext } from '../context/AuthContext';
import Menu from '../components/Menu';
import { RTCPeerConnection, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import RenderStream from '../components/RenderStream';
const configuration = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302'],
        },
    ],
};

export default function CreateCall({ navigation, route }) {
    const { theme } = useContext(AuthContext)
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

    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)

    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();



    const startLocalStream = async () => {
        const isFront = true;
        const devices = await mediaDevices.enumerateDevices();
        const facing = isFront ? 'front' : 'environment';
        const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === facing);
        const facingMode = isFront ? 'user' : 'environment';
        const constraints = {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 200,
                    minHeight: 200,
                    minFrameRate: 30,
                },
                facingMode,
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
        };
        const newStream = await mediaDevices.getUserMedia(constraints);

        setLocalStream(newStream);
        return newStream
    };

    const join = async () => {
        try {
            setAction("ok")
            const roomRef = doc(db, "rooms", roomId)
            const roomSnap = await getDoc(roomRef)
            if (roomSnap.exists()) {
                const stream = await startLocalStream()
                const localPC = new RTCPeerConnection(configuration)
                stream.getTracks().forEach(track => {
                    localPC.addTrack(track, [stream])
                });
                const calleeCandidateRef = collection(roomRef, "calleeCandidates")
                const callerCandidateRef = collection(roomRef, "callerCandidates")

                localPC.onicecandidate = async e => {
                    if (!e.candidate) {
                        return
                    }
                    await addDoc(calleeCandidateRef, e.candidate.toJSON())
                }


                localPC.ontrack = e => {
                    console.log(e);
                    if (e.streams && remoteStream !== e.streams[0]) {
                        setRemoteStream(e.streams[0]);
                    }
                };
                const roomSnapData = roomSnap.data()
                const { offer } = roomSnapData
                await localPC.setRemoteDescription(new RTCSessionDescription(offer));

                const answer = await localPC.createAnswer();
                await localPC.setLocalDescription(answer);

                await updateDoc(roomRef, { answer })


                setLoading(false)

                onSnapshot(callerCandidateRef, (doc) => {
                    doc.docChanges().forEach(async change => {
                        if (change.type === 'added') {
                            let data = change.doc.data();
                            await localPC.addIceCandidate(new RTCIceCandidate(data));
                        }
                    })
                })

                setCachedLocalPC(localPC);

            } else {
                setNotFound(true)
            }
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }


    const createRoom = async () => {
        try {
            setAction("ok")
            const stream = await startLocalStream()
            const localPC = new RTCPeerConnection(configuration);

            stream.getTracks().forEach(track => {
                localPC.addTrack(track, [stream])
            });

            const createRoomRef = collection(db, "rooms")
            const res = await addDoc(createRoomRef, {})
            setRoomId(res.id)
            const roomRef = doc(db, "rooms", res.id)
            const callerCandidateRef = collection(roomRef, "callerCandidates")
            const calleeCandidateRef = collection(roomRef, "calleeCandidates")



            localPC.ontrack = async e => {
                console.log(e);
                if (e.streams && remoteStream !== e.streams[0]) {
                    setRemoteStream(e.streams[0]);
                }
            };

            localPC.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return
                }
                await addDoc(callerCandidateRef, e.candidate.toJSON());
            }


            const offer = await localPC.createOffer();
            await localPC.setLocalDescription(offer)
            await setDoc(roomRef, { offer })
            onSnapshot(roomRef, async (doc) => {
                const data = doc.data()
                if (!localPC.currentRemoteDescription && data?.answer) {
                    const rtcSessionDescription = new RTCSessionDescription(data.answer);
                    await localPC.setRemoteDescription(rtcSessionDescription);
                }
            })
            console.log(res.id);
            setLoading(false)
            onSnapshot(calleeCandidateRef, (doc) => {
                doc.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        await localPC.addIceCandidate(new RTCIceCandidate(data));
                    }
                })
            })
            setCachedLocalPC(localPC);
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
            case "ok":
                console.log("Already joined or created Room or rejoined")
                break;
            default:
                setNotFound(true)
                break;
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
            if (cachedLocalPC) {
                cachedLocalPC.close();
            }
            setLocalStream(null);
            setRemoteStream(null);
            setCachedLocalPC(null);
            navigation.replace("Home")
            await deleteDoc(doc(db, "rooms", roomId))
        } catch (error) {
            console.log(error);
        }
    }



    const toggleMic = async () => {
        // if (!remoteStream) {
        //     return;
        //   }
        localStream.getAudioTracks().forEach(async (track) => {
            track.enabled = !track.enabled;
            setUser({ ...user, mic: track.enabled })
            setIsMicMute(track.enabled)
        })
    }

    const toggleVideo = async () => {
        localStream.getVideoTracks().forEach(async (track) => {
            track.enabled = !track.enabled;
            setUser({ ...user, video: track.enabled })
            setIsVideo(track.enabled)
        })
    }



    const switchCamera = () => {
        localStream.getVideoTracks().forEach(track => track._switchCamera());
    };



    if (notFound) {
        return (
            <View style={[styles.container, { alignItems: 'center', backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.textColor, fontSize: 30, textAlign: 'center' }}>404 Not Found</Text>
            </View>
        )
    }




    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {
                pushed ?
                    <StatusBar hidden />
                    :
                    <StatusBar backgroundColor={theme.colors.gradientColor1} />
            }
            <Animated.View style={[styles.headerContainer, { top: topValue }]}>
                <LinearGradient
                    colors={[theme.colors.gradientColor1, theme.colors.gradientColor2, theme.colors.gradientColor3]}
                    style={styles.background}
                >
                    <HeaderControls switchCamera={switchCamera} />
                </LinearGradient>
            </Animated.View>
            <Pressable onPress={pressing} style={pushed ? styles.fullPlayArea : styles.playarea}>

                <View style={styles.rtcContainer}>
                    <View style={styles.bigCard}>
                        <RenderStream stream={localStream} type="local" user={user} loading={loading} />
                    </View>
                    {
                        remoteStream && (
                            <TouchableHighlight style={styles.smallCard}>
                                <RenderStream stream={remoteStream} type="remote" user={user} loading={loading} />
                            </TouchableHighlight>
                        )
                    }
                </View>
            </Pressable>
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
                        video={isVideo}
                        mic={isMicMute}
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
                    roomId={roomId}
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

    rtcContainer: {
        flex: 1
    },
    bigCard: {
        backgroundColor: "black",
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
    },
    smallCard: {
        position: "absolute",
        backgroundColor: "rgb(30,30,30)",
        width: "35%",
        height: "30%",
        right: 10,
        bottom: 10,
        borderRadius: 10,
        overflow: "hidden",
    }
})
