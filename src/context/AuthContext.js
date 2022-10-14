import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext()
export const AuthContextProvier = ({ children }) => {
    const [currentUser, setCurrentUser] = useState({})
    const [activeRoom, setActiveRoom] = useState({})
    const [theme, setTheme] = useState()
    const [darkModeEnabled, setDarkModeEnabled] = useState(false)
    const getCurrentUser = async () => {
        const user = await AsyncStorage.getItem("currentUser")
        setCurrentUser(JSON.parse(user))
        const aR = await AsyncStorage.getItem("activeRoom")
        setActiveRoom(JSON.parse(aR))
        const themeStatus = await AsyncStorage.getItem("darkModeEnabled")
        setDarkModeEnabled(JSON.parse(themeStatus)?.status)
    }

    useEffect(() => {
        getCurrentUser()
    }, [])


    const changeTheme = () => {
        const theme = {
            colors: {
                primary: '#9d1faa',
                secondary: '#E21221',
                accent: '#f1c40f',
                background: darkModeEnabled ? '#181A20' : "#fff",
                textColor: darkModeEnabled ? "#efefef" : "#181A20",
                gradientColor1: darkModeEnabled ? "rgba(2,3,2,1)" : "rgba(200,200,200,1)",
                gradientColor2: darkModeEnabled ? "rgba(15,17,19,1)" : "rgba(200,200,200,0.1)",
                gradientColor3: darkModeEnabled ? "rgba(255,255,255,0)" : "rgba(255,255,255,0)",
            },
        };
        setTheme(theme)
    }

    useEffect(() => {
        changeTheme()
    }, [darkModeEnabled])
    return (
        <AuthContext.Provider value={{
            currentUser,
            setCurrentUser,
            theme,
            setDarkModeEnabled,
            darkModeEnabled,
            activeRoom,
            setActiveRoom
        }}>
            {children}
        </AuthContext.Provider>
    )
}