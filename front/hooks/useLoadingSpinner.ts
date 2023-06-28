import { useState, useEffect } from 'react';

interface ILoadingSpinnerHook {
    spinner: string[];
}

export const LOADING_SPINNER = ['|', '/', '-', '\\', '|', '/', '-', '\\'];

export const useLoadingSpinner = (args: ILoadingSpinnerHook, run: boolean) => {
    const [loadText, setloadText] = useState(args.spinner[0]);
    const [loadCounter, setloadCounter] = useState(0);

    useEffect(() => {
        let spinner: NodeJS.Timeout;
        if (run) {
            spinner = setTimeout(() => {
                const spinnerIndex = loadCounter % args.spinner.length;
                setloadText(args.spinner[spinnerIndex]);
                setloadCounter(loadCounter + 1);
                if (loadCounter === args.spinner.length) {
                    setloadCounter(0);
                }
            }, 100);
        }
        return () => {
            if (run) {
                clearTimeout(spinner);
            }
        };
    });

    return loadText;
};
