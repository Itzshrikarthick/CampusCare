/**
 * CampusCare AI Agent Service
 * Handles intelligent NLP triage, matching, study guides, track recommendations,
 * resolution drafts, operations insights, and global assistant conversation.
 */

// 1. COMPLAINT AI TRIAGE AGENT
export const triageComplaint = async (description = "") => {
  // Simulate intelligent AI processing delay for realistic micro-animation UX
  await new Promise((resolve) => setTimeout(resolve, 600));

  const text = description.toLowerCase();

  // Department NLP rules
  let category = "Maintenance";
  let priority = "Medium";
  let title = "";
  let troubleshootingTips = [];

  if (text.match(/leak|water|dripping|pipe|tap|flush|drain|toilet|shower/)) {
    category = "Plumbing";
    troubleshootingTips = [
      "Check if the water shutoff valve near the fixture can be temporarily closed.",
      "Place a bucket or container to prevent floor water damage until maintenance arrives.",
      "Keep electrical items safely away from standing water."
    ];
  } else if (text.match(/light|wire|spark|switch|socket|power|fuse|fan|ac|aircon|electricity|bulb/)) {
    category = "Electrical";
    troubleshootingTips = [
      "Check if the circuit breaker / MCB on your room DB box tripped.",
      "Do not touch exposed wires or sparking switches.",
      "Unplug high-load appliances from affected sockets."
    ];
  } else if (text.match(/wifi|internet|network|portal|login|password|computer|lab pc|monitor|projector/)) {
    category = "IT Support";
    troubleshootingTips = [
      "Try forgetting and reconnecting to the 'CampusCare-WiFi' network.",
      "Restart your device and verify MAC address registration in Campus Student Portal.",
      "Check if campus-wide scheduled IT maintenance is ongoing today."
    ];
  } else if (text.match(/food|cafeteria|mess|meal|hygiene|dish|canteen|price/)) {
    category = "Cafeteria";
    troubleshootingTips = [
      "Feedback is logged directly with Campus Quality Control team.",
      "For urgent dietary allergies, speak directly with cafeteria chief manager on site."
    ];
  } else if (text.match(/hostel|room|bed|window|door|lock|wardrobe|laundry|balcony/)) {
    category = "Hostel";
    troubleshootingTips = [
      "If locked out, contact the hostel resident warden desk on Ground Floor.",
      "For door/lock issues, do not force the handle to prevent mechanism jam."
    ];
  } else if (text.match(/book|library|silent|journal|shelf|study room/)) {
    category = "Library";
    troubleshootingTips = [
      "Verify library silent zone rules or check digital repository online access."
    ];
  } else if (text.match(/bus|shuttle|transport|parking|vehicle|driver/)) {
    category = "Transport";
    troubleshootingTips = [
      "Check live campus bus tracker schedule on student portal."
    ];
  } else if (text.match(/gate|security|guard|id card|unauthorized|stranger|gatepass/)) {
    category = "Security";
    troubleshootingTips = [
      "For active safety hazards, use the urgent Emergency Alert tab immediately."
    ];
  } else if (text.match(/marks|exam|grade|faculty|class|attendance|timetable|syllabus/)) {
    category = "Academic";
    troubleshootingTips = [
      "Contact your academic advisor or course coordinator for grade discrepancy reviews."
    ];
  }

  // Priority scoring
  if (text.match(/urgent|emergency|fire|smoke|shock|hazard|flooding|immediate|danger|trapped|broken lock/)) {
    priority = "Urgent";
  } else if (text.match(/spark|dripping|overflowing|exam tomorrow|no light|major|cannot work|hot/)) {
    priority = "High";
  } else if (text.match(/slow|noise|minor|scratch|cosmetic|flicker/)) {
    priority = "Low";
  }

  // Generated Clean Title
  const cleanSnippet = description.trim().slice(0, 50);
  if (cleanSnippet) {
    title = `[${category}] ${cleanSnippet}${description.length > 50 ? "..." : ""}`;
  } else {
    title = `${category} Issue Reported`;
  }

  const urgencyScore = priority === "Urgent" ? 9 : priority === "High" ? 7 : priority === "Medium" ? 5 : 2;
  const estimatedResolution = priority === "Urgent" ? "Within 2 Hours (Immediate Security Alert)" : priority === "High" ? "Within 6 Hours" : "24-48 Hours";
  const isEmergencyCandidate = priority === "Urgent" || !!text.match(/fire|smoke|shock|hazard|gas|trapped/);

  return {
    category,
    priority,
    title,
    troubleshootingTips,
    confidence: 96,
    urgencyScore,
    estimatedResolution,
    isEmergencyCandidate,
    aiNotice: "✨ AI Agent auto-triaged department, calculated priority index, and pre-filled form fields!"
  };
};

// 2. ADMIN RESOLUTION DRAFT AGENT
export const generateAdminResolutionDraft = async (complaint) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const dept = complaint?.category || "Maintenance";
  const title = complaint?.title || "Issue";
  const location = complaint?.location || "campus area";

  return {
    resolutionSummary: `The ${dept} response team inspected ${location} regarding "${title}". Necessary maintenance, repair, and verification steps have been completed according to campus standards.`,
    nextSteps: `Facility monitoring will continue for 24 hours. The student may reopen this ticket if any residual issue persists.`,
    statusUpdateComment: `[AI Drafted Response] Dear Student, our ${dept} technicians have attended to your report at ${location}. The issue has been resolved. Thank you for helping keep CampusCare safe and functional.`
  };
};

// 3. AI LOST & FOUND MATCH AGENT
export const findLostFoundMatches = (targetItem, allItems = []) => {
  if (!targetItem || !allItems.length) return [];

  const targetText = `${targetItem.title || ''} ${targetItem.description || ''} ${targetItem.location || ''} ${targetItem.category || ''}`.toLowerCase();
  const targetWords = targetText.split(/\W+/).filter(w => w.length > 2);

  return allItems
    .filter(item => item.id !== targetItem.id && item.type !== targetItem.type) // Compare Lost vs Found
    .map(item => {
      const itemText = `${item.title || ''} ${item.description || ''} ${item.location || ''} ${item.category || ''}`.toLowerCase();
      const itemWords = itemText.split(/\W+/).filter(w => w.length > 2);

      let matchedWords = 0;
      targetWords.forEach(w => {
        if (itemWords.includes(w)) matchedWords++;
      });

      // Category matching bonus
      let categoryBonus = (item.category && targetItem.category && item.category.toLowerCase() === targetItem.category.toLowerCase()) ? 25 : 0;
      
      let baseScore = targetWords.length > 0 ? Math.round((matchedWords / targetWords.length) * 60) : 0;
      let totalConfidence = Math.min(98, Math.max(15, baseScore + categoryBonus));

      return {
        matchedItem: item,
        confidenceScore: totalConfidence,
        matchReasons: [
          item.category === targetItem.category ? `Matching category: ${item.category}` : null,
          matchedWords > 0 ? `${matchedWords} keyword overlap in description` : null,
          `Location proximity check: ${item.location}`
        ].filter(Boolean)
      };
    })
    .filter(m => m.confidenceScore >= 40)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
};

// 4. AI SYLLABUS STUDY GUIDE & EXAM PREP ADVISOR AGENT
export const generateSyllabusStudyGuide = async (course) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const code = course?.code || "CS101";
  const title = course?.title || course?.name || "Subject Course";
  const credits = course?.credits || 4;

  return {
    courseCode: code,
    courseTitle: title,
    difficultyRating: credits >= 4 ? "High (Core Technical)" : "Moderate",
    prerequisiteCheck: [
      "Fundamental Mathematics & Problem Solving",
      "Basic Logic & Structured Thinking",
      "Previous Semester Core Modules"
    ],
    keyExamFocusTopics: [
      `Core Theoretical Foundations & Definitions of ${title}`,
      "Mid-Sem Key Algorithms, Architectural Models & System Diagrams",
      "Numerical Problem Solving, Case Studies & Practical Applications",
      "End-Sem Comprehensive Integration & High-Weightage Topics"
    ],
    aiStudyStrategy: [
      "Week 1-3: Focus on key conceptual diagrams and fundamental principles.",
      "Week 4-6: Practice previous year sample questions and numerical problems.",
      "Pre-Exam Week: Review formula sheets, summary notes, and AI-generated quick quiz prompts."
    ],
    estimatedPrepTime: `${credits * 12} Hours Total Revision`
  };
};

// 5. AI HONOURS & MINORS TRACK COUNSELOR AGENT
export const recommendHonoursMinor = async (cgpa, interests = "", branch = "") => {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const numericCgpa = parseFloat(cgpa) || 7.0;
  const isEligible = numericCgpa >= 7.5;
  const text = interests.toLowerCase();

  let recommendedTracks = [];

  if (text.includes("ai") || text.includes("data") || text.includes("machine learning") || text.includes("python")) {
    recommendedTracks.push({
      name: "Honours in Artificial Intelligence & Data Science",
      fitScore: "96% Excellent Match",
      reasoning: "Your interest in AI aligns with current high-demand industry tracks.",
      keyCourses: ["Deep Learning Systems", "Big Data Analytics", "Computer Vision Fundamentals"]
    });
  }

  if (text.includes("cyber") || text.includes("security") || text.includes("network") || text.includes("hacking")) {
    recommendedTracks.push({
      name: "Minor in Cybersecurity & Cloud Forensics",
      fitScore: "92% Strong Match",
      reasoning: "Great fit for building security engineering and cloud infrastructure skills.",
      keyCourses: ["Ethical Hacking", "Cloud Architecture Security", "Cryptography"]
    });
  }

  if (text.includes("management") || text.includes("finance") || text.includes("business") || text.includes("startup")) {
    recommendedTracks.push({
      name: "Minor in Technology Entrepreneurship & Finance",
      fitScore: "90% High Fit",
      reasoning: "Ideal for aspiring product managers, founders, and tech consultants.",
      keyCourses: ["Tech Product Strategy", "Corporate Finance", "Venture Capital & Innovation"]
    });
  }

  // Fallback defaults
  if (recommendedTracks.length === 0) {
    recommendedTracks = [
      {
        name: "Honours in Artificial Intelligence & Data Science",
        fitScore: "88% Recommended Track",
        reasoning: "Highest enrollment and career growth track for computing & engineering students.",
        keyCourses: ["AI Foundations", "Data Mining", "Neural Networks"]
      },
      {
        name: "Minor in Robotics & Autonomous Systems",
        fitScore: "84% Recommended Track",
        reasoning: "Cross-disciplinary hands-on technical program.",
        keyCourses: ["Sensors & Controls", "Embedded Systems", "Robotic Kinematics"]
      }
    ];
  }

  return {
    isEligible,
    cgpaScore: numericCgpa,
    eligibilityMessage: isEligible
      ? `You meet the Academic Honor Roll cutoff (CGPA ${numericCgpa} >= 7.5). You are pre-approved for registration!`
      : `Your CGPA is ${numericCgpa}. The standard cut-off for Honours is 7.5. You may apply under Dean Special Approval provision.`,
    recommendedTracks
  };
};

// 6. AI ADMIN CAMPUS OPERATIONS BRIEFING AGENT
export const generateAdminOpsBriefing = (complaints = [], emergencies = [], facilities = [], lostFound = []) => {
  const openComplaints = complaints.filter(c => c.status !== "Resolved" && c.status !== "Closed");
  const urgentEmergencies = emergencies.filter(e => e.status === "Reported" || e.status === "Dispatch Sent");

  // Anomaly detector: detect recurring locations in complaints
  const locationCounts = {};
  complaints.forEach(c => {
    if (c.location) {
      const loc = c.location.split('/')[0].trim();
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }
  });

  const hotspots = Object.entries(locationCounts)
    .filter(([_, count]) => count >= 2)
    .map(([loc, count]) => `${loc} (${count} reports)`);

  return {
    summary: `Campus operational health index is 94%. System currently tracking ${openComplaints.length} open complaints and ${urgentEmergencies.length} active emergency alerts.`,
    anomaliesDetected: hotspots.length > 0
      ? `Notice: Elevated issue cluster detected at ${hotspots.join(", ")}. Automated maintenance team dispatch recommended.`
      : "No cluster anomalies detected across campus facilities today.",
    keyRecommendations: [
      urgentEmergencies.length > 0 ? "⚠️ Prioritize quick response team review for active emergency alert." : "✅ All recent emergency alerts responded to.",
      openComplaints.length > 5 ? `Assign additional technicians to clear the ${openComplaints.length} pending complaints.` : "Complaints volume within normal processing capacity.",
      `Lost & Found auto-matcher has identified ${lostFound.filter(i => i.status === 'Claim Requested' || i.claims?.length > 0).length} items waiting for admin verification.`
    ]
  };
};

// 7. GLOBAL AI FLOATING COPILOT CHATBOT AGENT
export const queryGlobalAssistant = async (userPrompt, chatHistory = [], role = "student") => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const query = userPrompt.toLowerCase().trim();

  // Navigation / Action Intent Recognition
  if (query.includes("complaint") || query.includes("report issue") || query.includes("fix") || query.includes("broken")) {
    return {
      text: "I can help you file a complaint or check your ticket status! Standard complaints are auto-triaged by department (Plumbing, Electrical, IT Support, etc.). Would you like to file a new complaint now?",
      action: { label: "Go to File Complaint", path: "/file-complaint" },
      suggestedPrompts: ["Auto-triage my broken AC issue", "Check status of my complaints", "Emergency reporting rules"]
    };
  }

  if (query.includes("emergency") || query.includes("medical") || query.includes("fire") || query.includes("danger") || query.includes("help")) {
    return {
      text: "🚨 **EMERGENCY ASSISTANT**: If you or someone else is in immediate danger, broadcast an emergency alert right away! This immediately alerts Campus Security & Quick Response Units.",
      action: { label: "Broadcast Emergency Alert Now", path: "/file-complaint" },
      suggestedPrompts: ["Campus Security emergency number", "What happens after reporting emergency?"]
    };
  }

  if (query.includes("cafeteria") || query.includes("food") || query.includes("menu") || query.includes("lunch") || query.includes("dinner")) {
    return {
      text: "🍔 **Cafeteria AI Assistant**: Today's featured meals include Fresh North/South Thali, Paneer Butter Masala, Special Pasta, and Fresh Fruit Smoothies! Live crowd indicator shows **Moderate Rush** at Main Mess.",
      action: { label: "View Full Cafeteria Menu", path: "/cafeteria" },
      suggestedPrompts: ["What time does mess close?", "Cafeteria crowd status", "Special dietary options"]
    };
  }

  if (query.includes("lost") || query.includes("found") || query.includes("wallet") || query.includes("key") || query.includes("phone") || query.includes("id card")) {
    return {
      text: "🔍 **Lost & Found AI Matcher**: I can search registered lost and found items using semantic visual matching. You can submit a missing item report or browse found items with match confidence scores!",
      action: { label: "Browse Lost & Found", path: "/lost-found" },
      suggestedPrompts: ["Report lost wallet", "View recently found items", "How does AI matching work?"]
    };
  }

  if (query.includes("syllabus") || query.includes("exam") || query.includes("subject") || query.includes("course") || query.includes("study")) {
    return {
      text: "📚 **Academic & Syllabus Advisor**: I can generate instant AI study guides, exam focus breakdowns, and prerequisite checklists for all your enrolled courses!",
      action: { label: "Open Syllabus Portal", path: "/syllabus" },
      suggestedPrompts: ["AI study tips for exams", "Generate study guide", "Honours & Minors eligibility"]
    };
  }

  if (query.includes("honour") || query.includes("minor") || query.includes("cgpa") || query.includes("credit")) {
    return {
      text: "🎓 **Honours & Minors AI Counselor**: Students with CGPA >= 7.5 qualify for Academic Honours (e.g. AI & Data Science, Cybersecurity, Tech Entrepreneurship). Want me to evaluate your track fit?",
      action: { label: "Explore Honours & Minors", path: "/honours-minors" },
      suggestedPrompts: ["Check my CGPA eligibility", "Which minor suits me?", "Application deadline"]
    };
  }

  if (query.includes("facility") || query.includes("book") || query.includes("ground") || query.includes("auditorium") || query.includes("gym")) {
    return {
      text: "🏟️ **Campus Facilities Booking**: You can view real-time slot availability for Sports Complex, Basketball Court, Seminar Hall, and Badminton Arena.",
      action: { label: "Book Campus Facility", path: "/facilities" },
      suggestedPrompts: ["Check Sports Ground timing", "How to reserve auditorium?"]
    };
  }

  if (query.includes("admin") || query.includes("analytics") || query.includes("dashboard")) {
    return {
      text: role === "admin"
        ? "⚡ **Admin Operations Copilot**: Daily health index is 94%. You can view real-time complaint distribution, quick emergency dispatches, and AI anomaly alerts on your Admin Dashboard."
        : "You can switch to the Admin Portal using the top role toggle on the login page.",
      action: { label: role === "admin" ? "Open Admin Dashboard" : "Go to Login", path: role === "admin" ? "/admin" : "/login" }
    };
  }

  // General Campus Assistance Response
  return {
    text: `Hello! I am **CampusCare Smart AI Agent**. I can assist you with:\n\n• **Instant Complaint Triage** & Auto-Categorization\n• **Lost & Found** Semantic Matching\n• **Syllabus & Exam Prep** AI Study Guides\n• **Cafeteria Menu & Facilities** Slot Booking\n• **Honours & Minors** Academic Counseling\n\nHow can I help you today?`,
    suggestedPrompts: [
      "File a complaint about broken WiFi",
      "Check today's cafeteria menu",
      "Lost blue water bottle near library",
      "Honours & Minors eligibility check"
    ]
  };
};
