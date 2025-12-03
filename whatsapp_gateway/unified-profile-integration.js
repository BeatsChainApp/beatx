// WhatsApp Gateway - Unified Profile Integration
const axios = require('axios');

class WhatsAppProfileIntegration {
    constructor() {
        this.mcpUrl = process.env.MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app';
        this.n8nUrl = process.env.N8N_WEBHOOK_URL;
        this.profileCache = new Map();
    }

    async handleWhatsAppMessage(messageData) {
        try {
            const { whatsapp_id, profile, message } = messageData;
            
            if (!whatsapp_id) {
                console.warn('No WhatsApp ID in message data');
                return null;
            }

            // Get or create unified profile
            let userProfile = await this.getOrCreateProfile(whatsapp_id, profile);
            
            // Process message based on content
            if (message && message.text) {
                const response = await this.processTextMessage(userProfile, message.text.body);
                return response;
            }

            return {
                success: true,
                profile: userProfile,
                message: 'Profile synced successfully'
            };
        } catch (error) {
            console.error('WhatsApp message handling error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getOrCreateProfile(whatsappId, profileData = null) {
        try {
            // Check cache first
            if (this.profileCache.has(whatsappId)) {
                const cached = this.profileCache.get(whatsappId);
                if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
                    return cached.profile;
                }
            }

            // Try to find existing profile
            const findResponse = await axios.get(`${this.mcpUrl}/api/profiles/find`, {
                params: { whatsapp_id: whatsappId },
                timeout: 10000
            });

            let profile = null;

            if (findResponse.data.success && findResponse.data.profile) {
                profile = findResponse.data.profile;
                
                // Update WhatsApp platform status
                if (!profile.platforms.whatsapp.active) {
                    await this.updateProfilePlatformStatus(profile.user_id, 'whatsapp', true);
                }
            } else {
                // Create new profile
                profile = await this.createNewProfile(whatsappId, profileData);
            }

            // Cache the profile
            this.profileCache.set(whatsappId, {
                profile,
                timestamp: Date.now()
            });

            return profile;
        } catch (error) {
            console.error('Get or create profile error:', error);
            
            // Return minimal profile for offline operation
            return {
                user_id: `whatsapp_${whatsappId}`,
                whatsapp_id: whatsappId,
                display_name: profileData?.name || `WhatsApp User ${whatsappId}`,
                platforms: {
                    whatsapp: { active: true, profile: profileData }
                },
                app_role: 'USER',
                extension_role: 'USER',
                offline: true
            };
        }
    }

    async createNewProfile(whatsappId, profileData) {
        try {
            const userData = {
                whatsapp_id: whatsappId,
                display_name: profileData?.name || `WhatsApp User ${whatsappId}`,
                whatsapp_profile: profileData,
                platform: 'whatsapp',
                auth_method: 'whatsapp'
            };

            const response = await axios.post(`${this.mcpUrl}/api/profiles/authenticate`, userData, {
                timeout: 10000
            });

            if (response.data.success && response.data.profile) {
                console.log(`✅ Created new WhatsApp profile for ${whatsappId}`);
                
                // Notify N8N about new user
                if (this.n8nUrl) {
                    this.notifyN8N('whatsapp_user_created', {
                        whatsapp_id: whatsappId,
                        profile: response.data.profile
                    });
                }
                
                return response.data.profile;
            } else {
                throw new Error(response.data.error || 'Profile creation failed');
            }
        } catch (error) {
            console.error('Create new profile error:', error);
            throw error;
        }
    }

    async updateProfilePlatformStatus(userId, platform, active) {
        try {
            const updates = {
                platforms: {
                    [platform]: {
                        active,
                        last_login: new Date().toISOString()
                    }
                }
            };

            await axios.put(`${this.mcpUrl}/api/profiles/${userId}`, updates, {
                timeout: 10000
            });

            console.log(`✅ Updated ${platform} status for user ${userId}`);
        } catch (error) {
            console.error('Update platform status error:', error);
        }
    }

    async processTextMessage(userProfile, messageText) {
        try {
            const text = messageText.toLowerCase().trim();
            
            // Handle profile commands
            if (text.startsWith('/profile')) {
                return await this.handleProfileCommand(userProfile, text);
            }
            
            // Handle wallet commands
            if (text.startsWith('/wallet')) {
                return await this.handleWalletCommand(userProfile, text);
            }
            
            // Handle help command
            if (text === '/help' || text === 'help') {
                return this.getHelpMessage(userProfile);
            }
            
            // Handle status command
            if (text === '/status') {
                return this.getStatusMessage(userProfile);
            }
            
            // Handle link account command
            if (text.startsWith('/link')) {
                return await this.handleLinkCommand(userProfile, text);
            }

            // Default response for unrecognized commands
            return {
                success: true,
                response: {
                    type: 'text',
                    text: `Hello ${userProfile.display_name}! 👋\n\nI received your message: "${messageText}"\n\nType /help to see available commands.`
                }
            };
        } catch (error) {
            console.error('Process text message error:', error);
            return {
                success: false,
                response: {
                    type: 'text',
                    text: 'Sorry, I encountered an error processing your message. Please try again later.'
                }
            };
        }
    }

    async handleProfileCommand(userProfile, command) {
        const parts = command.split(' ');
        
        if (parts.length === 1 || parts[1] === 'show') {
            // Show profile information
            const profileText = `🎵 *Your BeatsChain Profile*\n\n` +
                `👤 Name: ${userProfile.display_name}\n` +
                `📧 Email: ${userProfile.email || 'Not linked'}\n` +
                `💳 Wallet: ${userProfile.wallet_address ? `${userProfile.wallet_address.slice(0, 6)}...${userProfile.wallet_address.slice(-4)}` : 'Not connected'}\n` +
                `✅ Verified: ${userProfile.is_verified ? 'Yes' : 'No'}\n` +
                `🎭 Role: ${userProfile.app_role}\n\n` +
                `*Active Platforms:*\n` +
                `📱 App: ${userProfile.platforms.app?.active ? '✅' : '❌'}\n` +
                `🔧 Extension: ${userProfile.platforms.extension?.active ? '✅' : '❌'}\n` +
                `💬 WhatsApp: ${userProfile.platforms.whatsapp?.active ? '✅' : '❌'}\n\n` +
                `Type /help for more commands.`;

            return {
                success: true,
                response: {
                    type: 'text',
                    text: profileText
                }
            };
        }
        
        if (parts[1] === 'update' && parts[2] === 'name' && parts[3]) {
            // Update display name
            const newName = parts.slice(3).join(' ');
            
            try {
                await axios.put(`${this.mcpUrl}/api/profiles/${userProfile.user_id}`, {
                    display_name: newName,
                    platform: 'whatsapp'
                });

                return {
                    success: true,
                    response: {
                        type: 'text',
                        text: `✅ Your name has been updated to: ${newName}`
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    response: {
                        type: 'text',
                        text: '❌ Failed to update your name. Please try again later.'
                    }
                };
            }
        }

        return {
            success: true,
            response: {
                type: 'text',
                text: 'Usage: /profile [show|update name <new_name>]'
            }
        };
    }

    async handleWalletCommand(userProfile, command) {
        const parts = command.split(' ');
        
        if (parts.length === 1 || parts[1] === 'show') {
            // Show wallet information
            try {
                const walletsResponse = await axios.get(`${this.mcpUrl}/api/profiles/${userProfile.user_id}/wallets`);
                
                if (walletsResponse.data.success) {
                    const wallets = walletsResponse.data.wallets;
                    
                    if (wallets.length === 0) {
                        return {
                            success: true,
                            response: {
                                type: 'text',
                                text: '💳 You don\'t have any wallets connected yet.\n\nTo connect a wallet, use the BeatsChain app or extension.'
                            }
                        };
                    }
                    
                    let walletText = '💳 *Your Wallets:*\n\n';
                    wallets.forEach((wallet, index) => {
                        walletText += `${index + 1}. ${wallet.wallet_address.slice(0, 6)}...${wallet.wallet_address.slice(-4)}\n`;
                        walletText += `   Platform: ${wallet.platform}\n`;
                        walletText += `   Type: ${wallet.wallet_type}\n`;
                        walletText += `   Primary: ${wallet.is_primary ? 'Yes' : 'No'}\n\n`;
                    });
                    
                    return {
                        success: true,
                        response: {
                            type: 'text',
                            text: walletText
                        }
                    };
                }
            } catch (error) {
                console.error('Get wallets error:', error);
            }
        }

        return {
            success: true,
            response: {
                type: 'text',
                text: '💳 Wallet management is available through the BeatsChain app and extension.\n\nDownload the app or install the browser extension to manage your wallets.'
            }
        };
    }

    async handleLinkCommand(userProfile, command) {
        const parts = command.split(' ');
        
        if (parts.length < 2) {
            return {
                success: true,
                response: {
                    type: 'text',
                    text: 'Usage: /link <email_or_wallet_address>\n\nThis will help link your WhatsApp to an existing BeatsChain account.'
                }
            };
        }

        const identifier = parts[1];
        
        try {
            // Check if identifier is email or wallet address
            const isEmail = identifier.includes('@');
            const searchParams = isEmail ? { email: identifier } : { wallet_address: identifier };
            
            const findResponse = await axios.get(`${this.mcpUrl}/api/profiles/find`, {
                params: searchParams
            });

            if (findResponse.data.success && findResponse.data.profile) {
                const existingProfile = findResponse.data.profile;
                
                // Merge profiles
                const mergeResponse = await axios.post(`${this.mcpUrl}/api/profiles/merge`, {
                    primary_user_id: existingProfile.user_id,
                    duplicate_user_ids: [userProfile.user_id]
                });

                if (mergeResponse.data.success) {
                    return {
                        success: true,
                        response: {
                            type: 'text',
                            text: `✅ Successfully linked your WhatsApp to your BeatsChain account!\n\nYour profiles have been merged. You now have access to all your data across platforms.`
                        }
                    };
                }
            } else {
                return {
                    success: true,
                    response: {
                        type: 'text',
                        text: `❌ No BeatsChain account found with ${isEmail ? 'email' : 'wallet address'}: ${identifier}\n\nPlease check the identifier or create an account first using the BeatsChain app.`
                    }
                };
            }
        } catch (error) {
            console.error('Link command error:', error);
            return {
                success: false,
                response: {
                    type: 'text',
                    text: '❌ Failed to link accounts. Please try again later or contact support.'
                }
            };
        }
    }

    getHelpMessage(userProfile) {
        const helpText = `🎵 *BeatsChain WhatsApp Bot*\n\n` +
            `Available commands:\n\n` +
            `📋 /profile - View your profile\n` +
            `📋 /profile update name <name> - Update your name\n` +
            `💳 /wallet - View your wallets\n` +
            `🔗 /link <email|wallet> - Link to existing account\n` +
            `📊 /status - Check your account status\n` +
            `❓ /help - Show this help message\n\n` +
            `🌐 Visit https://beatschain.app to access the full platform!\n\n` +
            `Need help? Contact support through the app.`;

        return {
            success: true,
            response: {
                type: 'text',
                text: helpText
            }
        };
    }

    getStatusMessage(userProfile) {
        const statusText = `📊 *Account Status*\n\n` +
            `👤 User ID: ${userProfile.user_id}\n` +
            `✅ Verified: ${userProfile.is_verified ? 'Yes' : 'No'}\n` +
            `📧 Email Verified: ${userProfile.email_verified ? 'Yes' : 'No'}\n` +
            `💳 Wallet Connected: ${userProfile.wallet_verified ? 'Yes' : 'No'}\n\n` +
            `*Platform Access:*\n` +
            `📱 Mobile App: ${userProfile.platforms.app?.active ? 'Active' : 'Inactive'}\n` +
            `🔧 Browser Extension: ${userProfile.platforms.extension?.active ? 'Active' : 'Inactive'}\n` +
            `💬 WhatsApp: Active\n\n` +
            `Last updated: ${new Date(userProfile.updated_at).toLocaleString()}`;

        return {
            success: true,
            response: {
                type: 'text',
                text: statusText
            }
        };
    }

    async notifyN8N(event, data) {
        if (!this.n8nUrl) return;

        try {
            await axios.post(`${this.n8nUrl}/webhook/whatsapp-profile`, {
                event,
                ...data,
                timestamp: new Date().toISOString()
            }, {
                timeout: 5000
            });
        } catch (error) {
            console.error('N8N notification error:', error);
        }
    }

    async syncProfileToMCP(whatsappId, profileData) {
        try {
            const response = await axios.post(`${this.mcpUrl}/api/profiles/whatsapp/sync`, {
                whatsapp_id: whatsappId,
                profile_data: profileData
            });

            return response.data;
        } catch (error) {
            console.error('MCP sync error:', error);
            return { success: false, error: error.message };
        }
    }

    clearCache() {
        this.profileCache.clear();
    }

    getCacheStats() {
        return {
            size: this.profileCache.size,
            entries: Array.from(this.profileCache.keys())
        };
    }
}

module.exports = { WhatsAppProfileIntegration };