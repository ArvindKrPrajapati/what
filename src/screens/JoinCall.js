import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useContext, useState } from 'react'
import { SPACING } from '../config/constants'
import { AuthContext } from '../context/AuthContext'



export default function JoinCall({ navigation }) {
    const { theme } = useContext(AuthContext)
    const [room, setRoom] = useState(null)
    const join = () => {
        if (room) {
            const r = room.trim()
            navigation.navigate("BeforeJoin", { room: r })
        }
    }
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <TextInput
                value={room}
                onChangeText={e => setRoom(e)}
                style={[styles.input, { color: theme.colors.textColor }]}
                placeholder='Enter Link or ID'
                placeholderTextColor={theme.colors.textColor}
                underlineColorAndroid={theme.colors.textColor}
            />
            <TouchableOpacity disabled={!room} onPress={join} style={[styles.btn, { opacity: !room ? 0.4 : 1 }]}>
                <Text style={styles.btnText}>Join</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING
    },
    input: {
        padding: 15,
    },
    btnText: {
        color: "#efefef",
        fontWeight: '500',
        fontSize: 16

    },
    btn: {
        backgroundColor: 'green',
        padding: 10,
        marginTop: 10,
        borderRadius: 10,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    }
})