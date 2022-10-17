import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RTCView } from 'react-native-webrtc'
import Icon from 'react-native-vector-icons/Ionicons'

export default function RenderStream({ stream, type, user, loading }) {
    const [_stream, setStream] = useState(null)
    useEffect(() => {
        setStream(stream)
    }, [stream])
    if (!_stream) {
        return null
    }
    return (
        <>
            <Icon style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }} name={user?.mic ? "mic" : "mic-off"} size={22} color="#efefef" />
            <RTCView
                style={styles.rtc}
                streamURL={_stream?.toURL()}
                objectFit="cover"
                mirror={true}
            />
            {
                user?.video || (
                    <View style={[styles.overlay, { backgroundColor: type == "local" ? "black" : "rgb(20,20,20)" }]}>
                        {
                            loading || (
                                <>
                                    <Image style={styles.dp} source={{ uri: user?.image }} />
                                    <Text numberOfLines={1} style={{ color: "#efefef", fontWeight: "700", marginTop: 8 }}>{user?.name}</Text>
                                </>
                            )
                        }
                    </View>
                )
            }
            {
                loading && (
                    <View style={[styles.overlay]}>
                        <Image style={styles.dp} source={{ uri: user?.image }} />
                        <Text numberOfLines={1} style={{ color: "#efefef", fontWeight: "700", marginTop: 8 }}>{user?.name}</Text>
                        <Text style={{ color: "#efefef", fontWeight: "700", fontSize: 16 }}>Creating Room</Text>
                    </View>)
            }
        </>
    )
}
const styles = StyleSheet.create({
    rtc: {
        flex: 1,
        height: "100%",
        width: "100%",
        overflow: "hidden",
        borderRadius: 10,
    },
    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    dp: {
        width: "35%",
        aspectRatio: 1 / 1,
        borderRadius: 500
    },
})