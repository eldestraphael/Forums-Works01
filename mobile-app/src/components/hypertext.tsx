import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';

interface HyperLinkText {
    onPress: () => Promise<void> | void;
    children: string;
}
const HyperlinkText = ({
    onPress,
    children
}: HyperLinkText) => {
    const handlePress = () => {

    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.link}>{children}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight:20
    },
    text: {
        fontSize: 16,
    },
    link: {
        fontSize: 16,
        color: '#7b93cc',
        textDecorationLine: 'underline',
    },
});

export default HyperlinkText;
