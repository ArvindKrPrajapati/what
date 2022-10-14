import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Login from '../screens/Login';
import JoinCall from '../screens/JoinCall';
import CreateCall from '../screens/CreateCall';
import Splash from '../screens/Splash';
import Profile from '../screens/Profile';
import { AuthContext } from '../context/AuthContext';
import Participants from '../screens/Participants';
import BeforeJoin from '../screens/BeforeJoin';
import { StatusBar } from 'react-native';
import Chat from '../screens/Chat';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { currentUser, theme, darkModeEnabled } = useContext(AuthContext)
    return (
        <>
            <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} backgroundColor={theme?.colors.background} />
            <NavigationContainer>
                <Stack.Navigator initialRouteName='Splash' screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Splash" component={Splash} />
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Home" component={Home} options={{ animation: "slide_from_right" }} />
                    <Stack.Screen name="CreateCall" component={CreateCall} options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen name="JoinCall" component={JoinCall} options={{
                        headerShown: true,
                        title: 'Join Call',
                        headerTintColor: theme?.colors.textColor,
                        headerStyle: {
                            backgroundColor: theme?.colors.background
                        },
                        animation: 'slide_from_left'
                    }} />
                    <Stack.Screen name="BeforeJoin" component={BeforeJoin} options={{
                        headerShown: true,
                        title: 'Join Call',
                        headerTintColor: theme?.colors.textColor,
                        headerStyle: {
                            backgroundColor: theme?.colors.background
                        },
                        animation: 'fade_from_bottom'
                    }} />
                    <Stack.Screen name="Profile" component={Profile} options={{
                        headerShown: true,
                        title: currentUser?.name,
                        headerTintColor: theme?.colors.textColor,
                        headerStyle: {
                            backgroundColor: theme?.colors.background
                        },
                        animation: 'fade_from_bottom',
                    }} />
                    <Stack.Screen name="Participants" component={Participants} options={{
                        headerShown: true,
                        title: "Participants",
                        headerTintColor: theme?.colors.textColor,
                        headerStyle: {
                            backgroundColor: theme?.colors.background
                        },
                        animation: 'slide_from_right',
                    }} />
                    <Stack.Screen name="Chat" component={Chat} options={{
                        headerShown: true,
                        title: "Chat Room",
                        headerTintColor: theme?.colors.textColor,
                        headerStyle: {
                            backgroundColor: theme?.colors.background
                        },
                        animation: 'slide_from_bottom',
                    }} />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}