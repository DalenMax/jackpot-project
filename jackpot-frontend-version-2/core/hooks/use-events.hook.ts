import { useEffect, useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { JACKPOT_CONFIG } from "../../config/jackpot";
import type {
  TicketPurchasedEvent,
  RoundEndedEvent,
  NewRoundStartedEvent,
  AirdropDistributedEvent,
} from "../../types/jackpot";

interface EventsState {
  ticketPurchases: TicketPurchasedEvent[];
  roundEnded: RoundEndedEvent[];
  newRounds: NewRoundStartedEvent[];
  airdrops: AirdropDistributedEvent[];
  isListening: boolean;
  error?: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<EventsState>({
    ticketPurchases: [],
    roundEnded: [],
    newRounds: [],
    airdrops: [],
    isListening: false,
  });

  const suiClient = new SuiClient({
    url: getFullnodeUrl("testnet"), // Using testnet to match contract deployment
  });

  const startListening = async () => {
    try {
      setEvents((prev) => ({ ...prev, isListening: true, error: undefined }));

      // Note: This is a basic polling approach
      // In production, you'd want to use WebSocket subscriptions
      console.log("🎧 Starting event listeners...");

      // Poll for events every 5 seconds
      const interval = setInterval(async () => {
        await fetchRecentEvents();
      }, 5000);

      // Store interval ID for cleanup
      (window as any).eventListenerInterval = interval;
    } catch (err) {
      console.error("Error starting event listeners:", err);
      setEvents((prev) => ({
        ...prev,
        isListening: false,
        error: err instanceof Error ? err.message : "Failed to start listening",
      }));
    }
  };

  const stopListening = () => {
    setEvents((prev) => ({ ...prev, isListening: false }));
    if ((window as any).eventListenerInterval) {
      clearInterval((window as any).eventListenerInterval);
      delete (window as any).eventListenerInterval;
    }
    console.log("🔇 Stopped event listeners");
  };

  const fetchRecentEvents = async () => {
    if (
      !JACKPOT_CONFIG.PACKAGE_ID ||
      JACKPOT_CONFIG.PACKAGE_ID.includes("YOUR_PACKAGE_ID_HERE")
    ) {
      // Skip if package ID not set
      return;
    }

    try {
      // Query events from the last 1 hour
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const eventQuery = await suiClient.queryEvents({
        query: {
          MoveModule: {
            package: JACKPOT_CONFIG.PACKAGE_ID,
            module: JACKPOT_CONFIG.MODULE_NAME,
          },
        },
        limit: 50,
        order: "descending",
      });

      const recentEvents = eventQuery.data.filter(
        (event) =>
          event.timestampMs && parseInt(event.timestampMs) > oneHourAgo,
      );

      // Process events by type
      const ticketPurchases: TicketPurchasedEvent[] = [];
      const roundEnded: RoundEndedEvent[] = [];
      const newRounds: NewRoundStartedEvent[] = [];
      const airdrops: AirdropDistributedEvent[] = [];

      recentEvents.forEach((event) => {
        const eventType = event.type.split("::").pop();

        switch (eventType) {
          case "TicketPurchased":
            if (event.parsedJson) {
              ticketPurchases.push(event.parsedJson as TicketPurchasedEvent);
            }
            break;
          case "RoundEnded":
            if (event.parsedJson) {
              roundEnded.push(event.parsedJson as RoundEndedEvent);
            }
            break;
          case "NewRoundStarted":
            if (event.parsedJson) {
              newRounds.push(event.parsedJson as NewRoundStartedEvent);
            }
            break;
          case "AirdropDistributed":
            if (event.parsedJson) {
              airdrops.push(event.parsedJson as AirdropDistributedEvent);
            }
            break;
        }
      });

      setEvents((prev) => ({
        ...prev,
        ticketPurchases,
        roundEnded,
        newRounds,
        airdrops,
      }));
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to fetch events",
      }));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Helper to get recent activity for display
  const getRecentActivity = (limit: number = 10) => {
    const allActivity = [
      ...events.ticketPurchases.map((e) => ({
        type: "ticket_purchase" as const,
        timestamp: Date.now(), // Would use actual timestamp from event
        data: e,
      })),
      ...events.roundEnded.map((e) => ({
        type: "round_ended" as const,
        timestamp: Date.now(),
        data: e,
      })),
      ...events.newRounds.map((e) => ({
        type: "new_round" as const,
        timestamp: Date.now(),
        data: e,
      })),
      ...events.airdrops.map((e) => ({
        type: "airdrop" as const,
        timestamp: Date.now(),
        data: e,
      })),
    ];

    return allActivity
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  return {
    events,
    startListening,
    stopListening,
    fetchRecentEvents,
    getRecentActivity,
  };
};
