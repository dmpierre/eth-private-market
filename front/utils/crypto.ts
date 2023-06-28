import { JubJubPubKey } from '@/types/types';

export const formatPubJubJubKey = (key: JubJubPubKey) => {
    return (
        key[0].toString().slice(0, 10) +
        '..., ' +
        key[1].toString().slice(0, 10) +
        '...'
    );
};
