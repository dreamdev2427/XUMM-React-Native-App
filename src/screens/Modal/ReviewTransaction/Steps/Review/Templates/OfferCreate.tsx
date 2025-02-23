import { isEmpty, isUndefined } from 'lodash';

import React, { Component } from 'react';
import { View, Text } from 'react-native';

import LedgerService from '@services/LedgerService';

import { AccountSchema, TrustLineSchema } from '@store/schemas/latest';

import { OfferCreate } from '@common/libs/ledger/transactions';
import { getAccountName, AccountNameType } from '@common/helpers/resolver';

import { AmountText, InfoMessage } from '@components/General';
import { RecipientElement } from '@components/Modules';

import { FormatDate } from '@common/utils/date';
import { NormalizeCurrencyCode } from '@common/utils/amount';
import { CalculateAvailableBalance } from '@common/utils/balance';

import Localize from '@locale';

import { AppStyles } from '@theme';
import styles from './styles';

import { TemplateProps } from './types';
/* types ==================================================================== */
export interface Props extends Omit<TemplateProps, 'transaction'> {
    transaction: OfferCreate;
    source: AccountSchema;
}

export interface State {
    isLoadingIssuerDetails: boolean;
    isLoadingIssuerFee: boolean;
    issuerDetails: AccountNameType;
    issuerFee: number;
    warnings: string;
}

/* Component ==================================================================== */
class OfferCreateTemplate extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isLoadingIssuerDetails: true,
            isLoadingIssuerFee: true,
            issuerDetails: undefined,
            issuerFee: 0,
            warnings: undefined,
        };
    }

    componentDidMount() {
        this.setIssuerTransferFee();
        this.setIssuerDetails();
        this.setWarnings();
    }

    setIssuerTransferFee = () => {
        const { transaction } = this.props;

        const issuerAddress = transaction.TakerGets.issuer || transaction.TakerPays.issuer;

        // get transfer rate from issuer account
        LedgerService.getAccountTransferRate(issuerAddress)
            .then((issuerFee) => {
                if (issuerFee) {
                    this.setState({
                        issuerFee,
                    });
                }
            })
            .catch(() => {
                // ignore
            })
            .finally(() => {
                this.setState({
                    isLoadingIssuerFee: false,
                });
            });
    };

    setIssuerDetails = () => {
        const { transaction } = this.props;

        const issuerAddress = transaction.TakerGets.issuer || transaction.TakerPays.issuer;

        getAccountName(issuerAddress)
            .then((res: any) => {
                if (!isEmpty(res)) {
                    this.setState({
                        issuerDetails: res,
                    });
                }
            })
            .catch(() => {
                // ignore
            })
            .finally(() => {
                this.setState({
                    isLoadingIssuerDetails: false,
                });
            });
    };

    setWarnings = () => {
        const { transaction, source } = this.props;

        let showFullBalanceLiquidWarning: boolean;

        // Warn users if they are about to trade their entire token worth
        const { issuer, currency, value } = transaction.TakerGets;

        if (currency === 'XRP') {
            // selling XRP
            showFullBalanceLiquidWarning = Number(value) >= CalculateAvailableBalance(source);
        } else {
            // sell IOU
            const line = source.lines.find(
                (l: TrustLineSchema) => l.currency.issuer === issuer && l.currency.currency === currency,
            );

            // only if not XLS14
            if (line && !line.isNFT) {
                showFullBalanceLiquidWarning = Number(value) >= Number(line.balance);
            }
        }

        if (showFullBalanceLiquidWarning) {
            this.setState({
                warnings: Localize.t('payload.tradeEntireTokenWorthWarning', {
                    currency: NormalizeCurrencyCode(currency),
                }),
            });
        }
    };

    render() {
        const { transaction } = this.props;
        const { isLoadingIssuerDetails, issuerDetails, isLoadingIssuerFee, issuerFee, warnings } = this.state;

        return (
            <>
                <Text style={[styles.label]}>{Localize.t('global.issuer')}</Text>
                <RecipientElement
                    containerStyle={[styles.contentBox, styles.addressContainer]}
                    isLoading={isLoadingIssuerDetails}
                    recipient={{
                        address: transaction.TakerGets.issuer || transaction.TakerPays.issuer,
                        ...issuerDetails,
                    }}
                />

                {warnings && (
                    <View style={AppStyles.paddingBottomSml}>
                        <InfoMessage type="error" label={warnings} />
                    </View>
                )}

                <Text style={[styles.label]}>{Localize.t('global.selling')}</Text>
                <View style={[styles.contentBox]}>
                    <AmountText
                        value={transaction.TakerGets.value}
                        currency={transaction.TakerGets.currency}
                        style={styles.amount}
                        immutable
                    />
                </View>

                <Text style={[styles.label]}>
                    {transaction.Flags.Sell
                        ? Localize.t('global.inExchangeForAtLeastReceive')
                        : Localize.t('global.inExchangeForReceive')}
                </Text>
                <View style={[styles.contentBox]}>
                    <AmountText
                        value={transaction.TakerPays.value}
                        currency={transaction.TakerPays.currency}
                        style={styles.amount}
                        immutable
                    />
                </View>

                <Text style={[styles.label]}>{Localize.t('global.issuerFee')}</Text>
                <View style={[styles.contentBox]}>
                    <Text style={[styles.value]}>{isLoadingIssuerFee ? 'Loading...' : `${issuerFee}%`}</Text>
                </View>

                {!isUndefined(transaction.Expiration) && (
                    <>
                        <Text style={[styles.label]}>{Localize.t('global.expireAfter')}</Text>
                        <View style={[styles.contentBox]}>
                            <Text style={[styles.value]}>{FormatDate(transaction.Expiration)}</Text>
                        </View>
                    </>
                )}

                {!isUndefined(transaction.OfferSequence) && (
                    <>
                        <Text style={[styles.label]}>{Localize.t('global.offerSequence')}</Text>
                        <View style={[styles.contentBox]}>
                            <Text style={styles.value}>{transaction.OfferSequence}</Text>
                        </View>
                    </>
                )}
            </>
        );
    }
}

export default OfferCreateTemplate;
