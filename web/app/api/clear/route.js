import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export async function POST(request) {
  try {
    // Fetch and delete all logs
    const logsSnapshot = await getDocs(collection(db, "logs"));
    const deleteLogs = logsSnapshot.docs.map(d => deleteDoc(doc(db, "logs", d.id)));
    
    // Fetch and delete all conflicts
    const conflictsSnapshot = await getDocs(collection(db, "conflicts"));
    const deleteConflicts = conflictsSnapshot.docs.map(d => deleteDoc(doc(db, "conflicts", d.id)));
    
    await Promise.all([...deleteLogs, ...deleteConflicts]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear data error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
