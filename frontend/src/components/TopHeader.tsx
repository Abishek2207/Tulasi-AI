"use client";
import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';

const TopHeader = ({ user }: { user: any }) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="top-header glass-panel animate-fade-in stagger-1">
            <div className={`search-bar glass-panel ${isSearchFocused ? 'focused' : ''}`}>
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search concepts, leetcode problems, or roadmaps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="input-field"
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                />
            </div>
            <div className="header-actions">
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>En</button>
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge"></span>
                </button>
                <div className="profile-info" style={{ textAlign: 'right', marginRight: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user?.name || 'Student User'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.email || 'Premium Plan'}</div>
                </div>
                <div className="profile-avatar">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff&bold=true`} alt="Profile" />
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
