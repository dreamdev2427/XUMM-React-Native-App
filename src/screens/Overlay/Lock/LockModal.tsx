/**
 * Lock screen
 */

import React, { Component } from 'react';
import { View, Text, SafeAreaView, Image, Platform } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';

import { BlurView } from '@react-native-community/blur';

import { CoreRepository } from '@store/repositories';
import { CoreSchema } from '@store/schemas/latest';
import { BiometryType } from '@store/types';

import { Navigator, Images } from '@common/helpers';
import { AppScreens } from '@common/constants';

// components
import { SecurePinInput } from '@components';

import Localize from '@locale';

// style
import { AppStyles } from '@theme';
import styles from './styles';

/* types ==================================================================== */
export interface Props {
    onUnlock: () => void;
}

export interface State {
    error: string;
    coreSettings: CoreSchema;
}
/* Component ==================================================================== */
class LockModal extends Component<Props, State> {
    static screenName = AppScreens.Overlay.Lock;

    private securePinInput: SecurePinInput;
    private contentView: SafeAreaView;

    static options() {
        return {
            topBar: {
                visible: false,
            },
        };
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            error: undefined,
            coreSettings: CoreRepository.getSettings(),
        };
    }

    componentDidMount() {
        const { coreSettings } = this.state;

        if (coreSettings.biometricMethod !== BiometryType.None) {
            setTimeout(() => {
                this.requestBiometricAuthenticate();
            }, 100);
        }
    }

    onPasscodeEntered = (passcode: string) => {
        CoreRepository.checkPasscode(passcode)
            .then(this.onUnlock)
            .catch(e => {
                this.securePinInput.clearInput();

                this.setState({
                    error: e.toString().replace('Error: ', ''),
                });
            });
    };

    onUnlock = () => {
        const { onUnlock } = this.props;

        // update last unlocked
        CoreRepository.updateTimeLastUnlocked();

        // close lock overlay
        Navigator.dismissOverlay();

        // run any callback
        if (typeof onUnlock === 'function') {
            onUnlock();
        }
    };

    requestBiometricAuthenticate = () => {
        FingerprintScanner.authenticate({
            description: Localize.t('global.unlock'),
            fallbackEnabled: true,
        })
            .then(this.onUnlock)
            .catch(() => {})
            .finally(() => {
                FingerprintScanner.release();
            });
    };

    render() {
        const { error, coreSettings } = this.state;
        return (
            <BlurView style={styles.blurView} blurAmount={Platform.OS === 'ios' ? 15 : 20} blurType="light">
                <SafeAreaView style={styles.container}>
                    <View style={[AppStyles.centerAligned, AppStyles.paddingSml]}>
                        <Image style={styles.logo} source={Images.xummLogo} />
                    </View>
                    <View style={[AppStyles.centerAligned, AppStyles.paddingSml]}>
                        <Text style={[AppStyles.p, AppStyles.bold]}>
                            {Localize.t('global.pleaseEnterYourPasscode')}
                        </Text>
                    </View>

                    <View style={[AppStyles.flex5, AppStyles.flexEnd]}>
                        <Text style={[AppStyles.p, AppStyles.bold, AppStyles.textCenterAligned, AppStyles.colorRed]}>
                            {error}
                        </Text>
                        <SecurePinInput
                            ref={r => {
                                this.securePinInput = r;
                            }}
                            virtualKeyboard
                            supportBiometric={coreSettings.biometricMethod !== BiometryType.None}
                            onBiometryPress={this.requestBiometricAuthenticate}
                            onInputFinish={this.onPasscodeEntered}
                            length={6}
                        />
                    </View>
                </SafeAreaView>
            </BlurView>
        );
    }
}

/* Export Component ==================================================================== */
export default LockModal;
