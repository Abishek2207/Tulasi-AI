"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import '@/lib/i18n';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' }
];

export default function LanguageToggle() {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useAppStore();

    const handleLanguageChange = (code: any) => {
        i18n.changeLanguage(code);
        setLanguage(code);
    };

    return (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <Globe size={14} className="text-gray-500" />
            <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-white transition-colors"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-950 text-white">
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
