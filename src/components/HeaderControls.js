import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useContext, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function HeaderControls() {
    const [speakerOn, setSpeakerOn] = useState(true);
    const { theme, darkModeEnabled, setDarkModeEnabled } = useContext(AuthContext)
    const handleToggleSpeaker = () => {
        // setSpeakerOn(currentState => {
        //   InCallManager.setForceSpeakerphoneOn(!currentState);
        //   return !currentState;
        // });
    };
    const changeTheme = async () => {
        await AsyncStorage.setItem("darkModeEnabled", JSON.stringify({ status: !darkModeEnabled }))
        setDarkModeEnabled(!darkModeEnabled)
    }
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={changeTheme}>
                <Icon name="moon" size={22} color={theme.colors.textColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.textColor, }]}>My Room</Text>
            <TouchableOpacity onPress={handleToggleSpeaker}>
                {speakerOn ? (
                    <Icon
                        name="volume-high"
                        color={theme.colors.textColor}
                        size={22}
                    />
                ) : (
                    <Icon
                        name="volume-mute"
                        color={theme.colors.textColor}
                        size={22}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    header: {
        padding: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 16,
        fontStyle: 'bold'
    }
})