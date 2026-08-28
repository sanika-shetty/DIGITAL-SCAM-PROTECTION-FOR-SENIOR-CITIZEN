/**
 * Guardian Bot - Firebase Firestore Connector & Reactive Memory Store
 * Supports both real Firebase Admin SDK and a zero-friction fallback In-Memory Store.
 */

import "dotenv/config";
import admin from "firebase-admin";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

class MemoryFirestore extends EventEmitter {
  constructor() {
    super();
    this.collections = {
      seniors: new Map(),
      alerts: new Map(),
      calls: new Map(),
      hardware_triggers: new Map()
    };
    this.seedInitialData();
  }

  seedInitialData() {
    // Default Senior Profiles
    this.collections.seniors.set("senior_01", {
      id: "senior_01",
      name: "Savitri Patel",
      age: 72,
      phone: "+91 98201 54321",
      location: "Bandra West, Mumbai (Home)",
      batteryLevel: 88,
      status: "PROTECTED",
      emergencyContact: {
        name: "Aarav Patel (Son)",
        phone: "+91 98190 12345",
        relation: "Son"
      },
      currentCall: null,
      lastActive: new Date().toISOString()
    });

    this.collections.seniors.set("senior_02", {
      id: "senior_02",
      name: "Ramesh Sharma",
      age: 78,
      phone: "+91 98450 67890",
      location: "Indiranagar, Bangalore (Home)",
      batteryLevel: 64,
      status: "PROTECTED",
      emergencyContact: {
        name: "Pooja Sharma (Daughter)",
        phone: "+91 98451 98765",
        relation: "Daughter"
      },
      currentCall: null,
      lastActive: new Date().toISOString()
    });

    // Seed realistic sample alert history
    const pastAlertId = "alert_seed_01";
    this.collections.alerts.set(pastAlertId, {
      id: pastAlertId,
      seniorId: "senior_01",
      seniorName: "Savitri Patel",
      type: "CALL_SCAM",
      severity: "CRITICAL",
      riskScore: 92,
      category: "Digital Arrest & Law Enforcement Impersonation",
      snippet: "This is CBI Officer Sharma from Cyber Crime. A warrant has been issued in your name for illegal narcotics FedEx parcel. Stay on video call and transfer Rs 50,000 to RBI verification account.",
      highlightedKeywords: ["cbi", "arrest warrant", "illegal narcotics", "fedex parcel", "stay on video call", "transfer rs 50,000", "rbi verification account"],
      status: "ACKNOWLEDGED",
      resolvedAt: null,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      audioWarningDelivered: true,
      channel: "PHONE_CALL"
    });
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Map();
    }
    const col = this.collections[name];

    return {
      doc: (id) => ({
        get: async () => ({
          exists: col.has(id),
          id,
          data: () => col.get(id)
        }),
        set: async (data, options = {}) => {
          const existing = col.get(id) || {};
          const updated = options.merge ? { ...existing, ...data, id } : { ...data, id };
          col.set(id, updated);
          this.emit(`change:${name}`, { type: "set", id, data: updated });
          return updated;
        },
        update: async (data) => {
          if (!col.has(id)) throw new Error(`Document ${id} not found`);
          const updated = { ...col.get(id), ...data, id };
          col.set(id, updated);
          this.emit(`change:${name}`, { type: "update", id, data: updated });
          return updated;
        },
        delete: async () => {
          col.delete(id);
          this.emit(`change:${name}`, { type: "delete", id });
          return true;
        }
      }),
      add: async (data) => {
        const id = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const document = { ...data, id, createdAt: new Date().toISOString() };
        col.set(id, document);
        this.emit(`change:${name}`, { type: "add", id, data: document });
        return { id, get: async () => ({ exists: true, id, data: () => document }) };
      },
      get: async () => {
        const docs = Array.from(col.values()).map(doc => ({
          id: doc.id,
          data: () => doc
        }));
        return {
          docs,
          empty: docs.length === 0,
          size: docs.length,
          forEach: (fn) => docs.forEach(fn)
        };
      }
    };
  }
}

let dbInstance = null;
let isRealFirebase = false;

export function initializeDatabase() {
  if (dbInstance) return { db: dbInstance, isRealFirebase };

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  try {
    if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
      const sa = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      dbInstance = admin.firestore();
      isRealFirebase = true;
      console.log("🔥 [Firebase] Connected using serviceAccountKey file.");
    } else if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n")
        })
      });
      dbInstance = admin.firestore();
      isRealFirebase = true;
      console.log("🔥 [Firebase] Connected using environment credentials.");
    } else {
      console.log("⚡ [Firebase] No credentials found. Initializing Reactive Memory Store (Demo Mode).");
      dbInstance = new MemoryFirestore();
      isRealFirebase = false;
    }
  } catch (error) {
    console.warn("⚠️ [Firebase] Initialization failed, falling back to Reactive Memory Store:", error.message);
    dbInstance = new MemoryFirestore();
    isRealFirebase = false;
  }

  return { db: dbInstance, isRealFirebase };
}

export const { db, isRealFirebase: isFirebaseLive } = initializeDatabase();
