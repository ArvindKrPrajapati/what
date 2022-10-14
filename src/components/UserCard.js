import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';

const { height, width } = Dimensions.get("window")
export default function UserCard({ item, participants, inPipMode, user, shareRoom }) {
    const [w, setW] = useState(participants.length === 1 ? "100%" : participants.length === 2 ? "97%" : "47%")
    const [h, setH] = useState(participants.length === 1 ? "100%" : participants.length === 2 ? height / 2 - 85 : 240)
    const [m, setM] = useState(participants.length > 1 ? 5 : 0)

    return (
        <View style={[styles.card, { width: inPipMode ? "100%" : w, height: inPipMode ? "100%" : h, margin: inPipMode ? 0 : m, borderRadius: inPipMode ? 0 : 10 }]}>
            <Icon style={{ position: "absolute", top: 20, right: 20 }} name={item?.mic ? "mic" : "mic-off"} size={22} color="#efefef" />
            {
                item?.video ?
                    <View>
                        {/* video here */}
                    </View>
                    : (<View style={{ alignItems: 'center' }}>
                        <Image style={styles.dp} source={{ uri: item?.image }} />
                        <Text style={{ color: "#efefef", fontWeight: "700", textAlign: 'center', marginTop: 15 }}>{item?.name}</Text>
                        {
                            item?.owner &&
                            <Text style={{ color: "#efefef", fontWeight: "400", textAlign: 'center' }}>({item?.uid == user.uid && " You /"} Owner )</Text>
                        }
                        {
                            (item?.uid == user.uid && !item?.owner) &&
                            <Text style={{ color: "#efefef", fontWeight: "400", textAlign: 'center' }}>( You )</Text>
                        }
                    </View>)
            }
            {
                (participants.length === 1 && !inPipMode) && (
                    <TouchableOpacity onPress={shareRoom} style={{ flexDirection: "row", alignItems: "center", padding: 10, paddingHorizontal: 20, borderRadius: 5 }}>
                        <Icon name='share-social-outline' color="#efefef" size={20} />
                        <Text style={{ color: "#efefef", marginLeft: 5 }}>Share this Room</Text>
                    </TouchableOpacity>
                )
            }
        </View >
    )
}
const styles = StyleSheet.create({
    dp: {
        width: "28%",
        aspectRatio: 1 / 1,
        borderRadius: 50
    },
    card: {
        justifyContent: "space-around",
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: "black"
    }
})