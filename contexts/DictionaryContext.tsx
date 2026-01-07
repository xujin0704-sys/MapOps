import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_GLOBAL_DICTIONARY } from '../constants';

type DictionaryItem = {
    label: string;
    value: string;
    color?: string;
    code?: string;
};

type DictionaryState = Record<string, DictionaryItem[]>;

interface DictionaryContextType {
    dictionary: DictionaryState;
    updateDictionary: (category: string, items: DictionaryItem[]) => void;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export const DictionaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dictionary, setDictionary] = useState<DictionaryState>(MOCK_GLOBAL_DICTIONARY);

    const updateDictionary = (category: string, items: DictionaryItem[]) => {
        setDictionary(prev => ({
            ...prev,
            [category]: items
        }));
    };

    return (
        <DictionaryContext.Provider value={{ dictionary, updateDictionary }}>
            {children}
        </DictionaryContext.Provider>
    );
};

export const useDictionary = () => {
    const context = useContext(DictionaryContext);
    if (!context) {
        throw new Error('useDictionary must be used within a DictionaryProvider');
    }
    return context;
};