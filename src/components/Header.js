import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header() {
    const { currentUser, theme, setDarkModeEnabled, darkModeEnabled } = useContext(AuthContext)
    const navigation = useNavigation()

    const changeTheme = async () => {
        await AsyncStorage.setItem("darkModeEnabled", JSON.stringify({ status: !darkModeEnabled }))
        setDarkModeEnabled(!darkModeEnabled)
    }
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity onPress={changeTheme}>
                <Icon name='moon' size={22} color={theme.colors.textColor} />
            </TouchableOpacity>
            <Text style={[styles.brand, { color: theme.colors.textColor }]}>What!</Text>
            <TouchableOpacity onPress={() => { navigation.navigate("Profile") }}>
                <Image style={styles.dp} source={{ uri: currentUser?.image }} />
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    brand: {
        fontWeight: '800',
        fontSize: 22
    },
    dp: {
        width: 30,
        aspectRatio: 1 / 1,
        borderRadius: 50
    }
})