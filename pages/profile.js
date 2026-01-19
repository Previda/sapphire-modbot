import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [allGuilds, setAllGuilds] = useState([]);
  const [manageableGuilds, setManageableGuilds] = useState([]);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [guildRoles, setGuildRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setAllGuilds(data.allGuilds || []);
          setManageableGuilds(data.guilds || []);
          
          if (data.guilds && data.guilds.length > 0) {
            setSelectedGuild(data.guilds[0]);
            setGuildRoles(data.guilds[0].roles || []);
          }
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionName = (permission) => {
    const permissions = {
      '0x8': 'Administrator',
      '0x20': 'Manage Server',
      '0x10000000': 'Manage Roles',
      '0x2': 'Kick Members',
      '0x4': 'Ban Members',
      '0x10': 'Manage Channels',
      '0x20000': 'Manage Messages',
      '0x8000': 'Send Messages',
      '0x400': 'View Channel'
    };
    
    const permInt = parseInt(permission);
    const perms = [];
    
    for (const [flag, name] of Object.entries(permissions)) {
      if ((permInt & parseInt(flag)) === parseInt(flag)) {
        perms.push(name);
      }
    }
    
    return perms.length > 0 ? perms : ['Member'];
  };

  const selectGuild = (guild) => {
    setSelectedGuild(guild);
    setGuildRoles(guild.roles || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - {user?.username || 'User'}</title>
        <meta name="description" content="Your Discord profile and server information" />
      </Head>

      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-white hover:text-emerald-300 transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <div className="w-32"></div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* User Info Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 mb-8">
            <div className="flex items-center space-x-6">
              {user?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
                  alt={user.username}
                  className="w-24 h-24 rounded-full border-4 border-emerald-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-emerald-500">
                  {user?.username?.[0] || 'U'}
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user?.username}
                  {user?.discriminator && user.discriminator !== '0' && (
                    <span className="text-gray-400">#{user.discriminator}</span>
                  )}
                </h2>
                <p className="text-gray-300 mb-2">User ID: {user?.id}</p>
                <p className="text-gray-400">{user?.email}</p>
              </div>

              <div className="text-right">
                <div className="bg-zinc-900 rounded-xl px-6 py-3 mb-2 border border-white/10">
                  <p className="text-white font-bold text-2xl">{allGuilds.length}</p>
                  <p className="text-zinc-300 text-sm">Total Servers</p>
                </div>
                <div className="bg-zinc-900 rounded-xl px-6 py-3 border border-white/10">
                  <p className="text-white font-bold text-2xl">{manageableGuilds.length}</p>
                  <p className="text-zinc-300 text-sm">Can Manage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Server Tabs */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden mb-8">
            <div className="border-b border-white/10 p-4">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedGuild(null)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    !selectedGuild
                      ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  📊 Overview
                </button>
                {manageableGuilds.map((guild) => (
                  <button
                    key={guild.id}
                    onClick={() => selectGuild(guild)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${
                      selectedGuild?.id === guild.id
                        ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {guild.icon ? (
                      <img
                        src={guild.icon}
                        alt={guild.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                        {guild.name[0]}
                      </div>
                    )}
                    <span>{guild.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {!selectedGuild ? (
                /* Overview */
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">All Your Servers</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allGuilds.map((guild) => {
                      const canManage = manageableGuilds.some(g => g.id === guild.id);
                      const permissions = getPermissionName(guild.permissions);
                      
                      return (
                        <div
                          key={guild.id}
                          className={`bg-white/10 rounded-2xl p-6 border transition-all hover:scale-105 cursor-pointer ${
                            canManage
                              ? 'border-green-500/50 hover:border-green-500'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          onClick={() => canManage && selectGuild(manageableGuilds.find(g => g.id === guild.id))}
                        >
                          <div className="flex items-center space-x-4 mb-4">
                            {guild.icon ? (
                              <img
                                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`}
                                alt={guild.name}
                                className="w-16 h-16 rounded-full"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-400 flex items-center justify-center text-2xl font-bold text-white">
                                {guild.name[0]}
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-bold text-lg">{guild.name}</h4>
                              <p className="text-gray-400 text-sm">ID: {guild.id}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Status:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                canManage
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                                {canManage ? '✅ Can Manage' : '👤 Member'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Owner:</span>
                              <span className="text-white text-sm">
                                {guild.owner ? '👑 Yes' : 'No'}
                              </span>
                            </div>

                            <div className="pt-3 border-t border-white/10">
                              <p className="text-gray-400 text-xs mb-2">Your Permissions:</p>
                              <div className="flex flex-wrap gap-1">
                                {permissions.slice(0, 3).map((perm, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-white/5 text-zinc-200 rounded text-xs border border-white/20"
                                  >
                                    {perm}
                                  </span>
                                ))}
                                {permissions.length > 3 && (
                                  <span className="px-2 py-1 bg-emerald-500/15 text-emerald-300 rounded text-xs border border-emerald-500/30">
                                    +{permissions.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Selected Server Details */
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 mb-8">
                    {selectedGuild.icon ? (
                      <img
                        src={selectedGuild.icon}
                        alt={selectedGuild.name}
                        className="w-24 h-24 rounded-2xl border-4 border-purple-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-purple-500">
                        {selectedGuild.name[0]}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2">{selectedGuild.name}</h3>
                      <p className="text-gray-400 mb-2">Server ID: {selectedGuild.id}</p>
                      <div className="flex items-center space-x-4">
                        {selectedGuild.owner && (
                          <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/30 font-medium">
                            👑 Owner
                          </span>
                        )}
                        <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 font-medium">
                          ✅ Can Manage
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {selectedGuild.memberCount > 0 && (
                        <div className="bg-white/10 rounded-xl px-6 py-3 mb-2">
                          <p className="text-white font-bold text-2xl">{selectedGuild.memberCount.toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">Members</p>
                        </div>
                      )}
                      {selectedGuild.hasBot && (
                        <div className="bg-emerald-600/20 rounded-xl px-6 py-3 border border-emerald-500/30">
                          <p className="text-emerald-300 font-medium">🤖 Bot Installed</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Your Roles */}
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/15">
                    <h4 className="text-xl font-bold text-white mb-4">Your Roles in this Server</h4>
                    
                    {guildRoles && guildRoles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guildRoles.map((roleId, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-emerald-600/15 to-sky-600/15 rounded-xl p-4 border border-emerald-500/30"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                              <span className="text-white font-medium">Role {index + 1}</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">ID: {roleId}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No role information available</p>
                    )}
                  </div>

                  {/* Your Permissions */}
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                    <h4 className="text-xl font-bold text-white mb-4">Your Permissions</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {getPermissionName(selectedGuild.permissions).map((perm, index) => (
                        <div
                          key={index}
                          className="bg-green-500/20 rounded-lg p-3 border border-green-500/30 text-center"
                        >
                          <p className="text-green-300 font-medium">{perm}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Server Stats */}
                  {selectedGuild.memberCount > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/10 rounded-2xl p-6 border border-white/15 text-center">
                        <div className="text-4xl mb-2">👥</div>
                        <p className="text-2xl font-bold text-white">{selectedGuild.memberCount.toLocaleString()}</p>
                        <p className="text-gray-400">Total Members</p>
                      </div>
                      
                      {selectedGuild.joinedAt && (
                        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
                          <div className="text-4xl mb-2">📅</div>
                          <p className="text-lg font-bold text-white">
                            {new Date(selectedGuild.joinedAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400">You Joined</p>
                        </div>
                      )}
                      
                      <div className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
                        <div className="text-4xl mb-2">
                          {selectedGuild.hasBot ? '✅' : '❌'}
                        </div>
                        <p className="text-lg font-bold text-white">
                          {selectedGuild.hasBot ? 'Installed' : 'Not Installed'}
                        </p>
                        <p className="text-gray-400">Bot Status</p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                    <h4 className="text-xl font-bold text-white mb-4">Quick Actions</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href={`/dashboard?server=${selectedGuild.id}`}
                        className="block p-4 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-xl text-white font-medium text-center hover:from-emerald-700 hover:to-sky-700 transition-all"
                      >
                        ⚡ Manage Commands
                      </Link>
                      
                      <Link
                        href={`/dashboard?server=${selectedGuild.id}&tab=logs`}
                        className="block p-4 bg-white/10 rounded-xl text-white font-medium text-center border border-white/20 hover:bg-white/20 transition-all"
                      >
                        📋 View Logs
                      </Link>
                      
                      {!selectedGuild.hasBot && (
                        <a
                          href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222'}&permissions=8&scope=bot%20applications.commands&guild_id=${selectedGuild.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-green-600 rounded-xl text-white font-medium text-center hover:bg-green-700 transition-all"
                        >
                          🤖 Add Bot to Server
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
