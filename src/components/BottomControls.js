import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
var t;
export default function BottomControls({
    mic,
    video,
    toggleMic,
    toggleVideo,
    handleLeave,
    disabled,
    setModalOpen
}) {
    const { theme } = useContext(AuthContext)
    return (
        <View style={styles.btnContainer}>
            <TouchableOpacity disabled={disabled} onPress={handleLeave} style={[styles.btn, { backgroundColor: 'red', borderWidth: 0 }]}>
                <Icon name="call" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity disabled={disabled} onPress={toggleMic} style={[styles.btn, { borderColor: theme.colors.textColor }]}>
                <Icon name={mic() ? "mic" : "mic-off"} size={24} color={theme.colors.textColor} />
            </TouchableOpacity>
            <TouchableOpacity disabled={disabled} onPress={toggleVideo} style={[styles.btn, { borderColor: theme.colors.textColor }]}>
                <Icon name={video() ? "videocam" : "videocam-off"} size={24} color={theme.colors.textColor} />
            </TouchableOpacity>
            <TouchableOpacity disabled={disabled} onPress={() => { setModalOpen(p => !p) }} style={[styles.btn, { borderColor: theme.colors.textColor }]}>
                <Icon name="more-vert" size={24} color={theme.colors.textColor} />
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: 70,
        transform: [{ rotate: '180deg' }],
    },
    btn: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        borderWidth: 1
    }
})