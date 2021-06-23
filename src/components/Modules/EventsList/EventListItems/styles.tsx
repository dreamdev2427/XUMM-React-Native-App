import StyleService from '@services/StyleService';

import { AppFonts, AppSizes } from '@theme';

/* Styles ==================================================================== */
const styles = StyleService.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: AppSizes.heightPercentageToDP(7.5),
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: -5,
        marginRight: -5,
    },
    iconContainer: {
        borderColor: '$lightGrey',
        backgroundColor: '$tint',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        width: AppSizes.scale(40),
        height: AppSizes.scale(40),
    },
    icon: {
        alignItems: 'center',
        resizeMode: 'contain',
        tintColor: '$contrast',
    },
    xAppsIcon: {
        tintColor: '$grey',
        marginLeft: 8,
        resizeMode: 'contain',
        height: 15,
        width: 35,
    },
    label: {
        fontFamily: AppFonts.base.familyBold,
        fontSize: AppFonts.subtext.size,
        color: '$textPrimary',
    },
    description: {
        fontFamily: AppFonts.base.familyBold,
        fontSize: AppFonts.subtext.size * 0.9,
        color: '$grey',
    },
    amount: {
        fontFamily: AppFonts.base.familyMonoBold,
        fontSize: AppFonts.base.size,
        color: '$textPrimary',
    },
    currency: {
        fontFamily: AppFonts.base.familyMono,
        fontSize: AppFonts.subtext.size * 0.9,
    },
    outgoingColor: {
        color: '$red',
    },
    orangeColor: {
        color: '$orange',
    },
    naturalColor: {
        color: '$grey',
    },
});

export default styles;
