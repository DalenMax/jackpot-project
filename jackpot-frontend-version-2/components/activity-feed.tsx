"use client";

import { useEvents } from '../core/hooks/use-events.hook';
import { useEffect } from 'react';

export function ActivityFeed() {
  const { events, startListening, getRecentActivity } = useEvents();
  
  useEffect(() => {
    // Temporarily disabled to prevent excessive API requests
    // startListening();
  }, [startListening]);

  const recentActivity = getRecentActivity(10);

  return (
    <div className="glass-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Live Activity</h3>
        <div className="w-3 h-3 rounded-full bg-yellow-400">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-400">Activity Feed Temporarily Disabled</p>
            <p className="text-gray-500 text-sm mt-1">
              Events polling disabled to prevent rate limiting
            </p>
          </div>
        ) : (
          recentActivity.map((activity, index) => (
            <div key={index} className="glass-card p-3">
              {activity.type === 'ticket_purchase' && (
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎟️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      Tickets purchased
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.data.ticket_count} tickets • Round {activity.data.round_number}
                    </p>
                  </div>
                </div>
              )}
              
              {activity.type === 'round_ended' && (
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      Round {activity.data.round_number} ended
                    </p>
                    <p className="text-xs text-gray-400">
                      Prize: {activity.data.prize_amount} SUI
                    </p>
                  </div>
                </div>
              )}
              
              {activity.type === 'new_round' && (
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎲</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      New round started
                    </p>
                    <p className="text-xs text-gray-400">
                      Round {activity.data.round_number}
                    </p>
                  </div>
                </div>
              )}
              
              {activity.type === 'airdrop' && (
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎁</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      Airdrop distributed
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.data.recipients.length} recipients
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {events.error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{events.error}</p>
        </div>
      )}
    </div>
  );
}