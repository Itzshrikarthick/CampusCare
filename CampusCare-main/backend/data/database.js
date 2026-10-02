const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/db.json');

const defaultData = {
  complaints: [
    {
      id: "comp_1",
      title: "Broken AC in Library Silent Zone",
      category: "Library",
      priority: "High",
      location: "Central Library, 2nd Floor",
      description: "The air conditioning unit in the 2nd floor silent study zone is dripping water onto the desks and blowing hot air.",
      status: "In Progress",
      photos: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"],
      assignedTo: "Rajesh Kumar (HVAC Lead)",
      eta: "2026-07-30T17:00:00.000Z",
      adminRemarks: "Technician assigned. Replacement motor ordered.",
      rating: 0,
      ratingFeedback: "",
      reopenedCount: 0,
      timeline: [
        { id: "t1", status: "Submitted", comment: "Complaint filed by student.", author: "Student", date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: "t2", status: "Under Review", comment: "Reviewed by Maintenance Admin.", author: "Admin", date: new Date(Date.now() - 86400000 * 1.5).toISOString() },
        { id: "t3", status: "In Progress", comment: "Assigned to HVAC team lead.", author: "Admin", date: new Date(Date.now() - 86400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "comp_2",
      title: "Campus Wi-Fi drops constantly near Block B",
      category: "IT Support",
      priority: "High",
      location: "Lecture Hall B3",
      description: "The eduroam network keeps disconnecting every 5 minutes in Lecture Hall B3. Makes it impossible to follow online materials or take quizzes.",
      status: "Assigned",
      photos: [],
      assignedTo: "Suresh Menon (IT Network Team)",
      eta: "2026-07-29T14:00:00.000Z",
      adminRemarks: "Access Point reset scheduled during maintenance window.",
      rating: 0,
      ratingFeedback: "",
      reopenedCount: 0,
      timeline: [
        { id: "t1", status: "Submitted", comment: "Issue reported.", author: "Student", date: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: "t2", status: "Assigned", comment: "Assigned to Network admin.", author: "Admin", date: new Date(Date.now() - 3600000 * 2).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: "comp_3",
      title: "Clogged sink in Boys Hostel C",
      category: "Plumbing",
      priority: "Medium",
      location: "Hostel C, 3rd Floor Washroom",
      description: "The leftmost washbasin on the 3rd floor washroom in Hostel C is completely clogged, overflowing, and smells terrible.",
      status: "Submitted",
      photos: [],
      assignedTo: "",
      eta: "",
      adminRemarks: "",
      rating: 0,
      ratingFeedback: "",
      reopenedCount: 0,
      timeline: [
        { id: "t1", status: "Submitted", comment: "Complaint received.", author: "Student", date: new Date(Date.now() - 3600000 * 2).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "comp_4",
      title: "Gym Treadmill #3 broken",
      category: "Maintenance",
      priority: "Low",
      location: "Sports Complex Gym",
      description: "The motor on treadmill #3 makes a loud grinding noise and stops suddenly.",
      status: "Resolved",
      photos: [],
      assignedTo: "Fitness Maintenance Division",
      eta: "2026-07-27T12:00:00.000Z",
      adminRemarks: "Belt replaced and lubricated.",
      rating: 5,
      ratingFeedback: "Fixed promptly! Thank you.",
      reopenedCount: 0,
      timeline: [
        { id: "t1", status: "Submitted", comment: "Reported.", author: "Student", date: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: "t2", status: "Resolved", comment: "Repairs completed.", author: "Admin", date: new Date(Date.now() - 86400000 * 1).toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  emergencies: [
    {
      id: "emerg_1",
      type: "Medical",
      location: "Football Ground",
      description: "Student collapsed due to heat exhaustion and requires an ambulance immediately.",
      status: "Resolved",
      time: new Date(Date.now() - 86400000 * 2).toISOString(),
      photos: [],
      reportedBy: "user"
    },
    {
      id: "emerg_2",
      type: "Security",
      location: "Main Gate Entry",
      description: "Tailgaters entered the campus without ID checks. Suspicious behavior reported.",
      status: "Reported",
      time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      photos: [],
      reportedBy: "user"
    }
  ],
  events: [
    {
      id: "event_1",
      title: "HackCampus 2026: AI & Cloud Hackathon",
      department: "CSE",
      clubId: "club_1",
      clubName: "Coding & AI Society",
      category: "Academic",
      description: "36-hour hackathon focusing on AI agents and cloud applications. Cash prizes up to ₹50,000! Mentorship from Google & Microsoft engineers.",
      venue: "Main Campus Auditorium",
      coordinator: "Dr. A. Sharma (CSE Dept)",
      coordinatorContact: "asharma@campuscare.edu",
      date: "2026-08-15",
      time: "09:00 AM",
      registrationDeadline: "2026-08-12T23:59:00.000Z",
      maxParticipants: 300,
      registeredCount: 245,
      registrations: ["student1@campuscare.edu", "student2@campuscare.edu"],
      eligibility: "Open to all CSE, IT, AI&DS, and AIML students",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
      isPast: false
    },
    {
      id: "event_2",
      title: "RoboWars & Automation Expo",
      department: "ECE",
      clubId: "club_2",
      clubName: "Robotics Club",
      category: "Technical",
      description: "Inter-department robotics battle and IoT project exhibition. Showcase your custom built autonomous bots.",
      venue: "ECE Innovation Lab & Arena",
      coordinator: "Prof. R. Venkatesh",
      coordinatorContact: "rvenkat@campuscare.edu",
      date: "2026-08-20",
      time: "10:00 AM",
      registrationDeadline: "2026-08-18T23:59:00.000Z",
      maxParticipants: 150,
      registeredCount: 98,
      registrations: [],
      eligibility: "Open to ECE, EEE, and Mechanical students",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60",
      isPast: false
    },
    {
      id: "event_3",
      title: "Sustainable Civil Engineering Summit 2026",
      department: "Civil",
      clubId: "club_3",
      clubName: "Green Build Society",
      category: "Workshop",
      description: "Guest lecture and hands-on workshop on green concrete and earthquake-resistant structures.",
      venue: "Civil Seminar Hall B",
      coordinator: "Dr. K. Patel",
      coordinatorContact: "kpatel@campuscare.edu",
      date: "2026-07-10",
      time: "11:00 AM",
      registrationDeadline: "2026-07-08T23:59:00.000Z",
      maxParticipants: 100,
      registeredCount: 85,
      registrations: ["student1@campuscare.edu"],
      eligibility: "All Civil & Mechanical engineering students",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=60",
      isPast: true
    }
  ],
  clubs: [
    {
      id: "club_1",
      name: "Coding & AI Society",
      department: "CSE",
      category: "Technical",
      description: "The official computer science club promoting competitive programming, open source projects, and deep learning research.",
      coordinator: "Prof. N. Swaminathan",
      membersCount: 420,
      members: ["student1@campuscare.edu", "student2@campuscare.edu"],
      announcements: [
        { id: "ca_1", title: "Weekly LeetCode Sprint", content: "Sprint #42 is live this Saturday at 8 PM on HackerRank.", date: "2026-07-27" },
        { id: "ca_2", title: "GitHub Campus Ambassador Applications Open", content: "Submit your Github profiles by Friday.", date: "2026-07-25" }
      ]
    },
    {
      id: "club_2",
      name: "Robotics Club",
      department: "ECE",
      category: "Technical",
      description: "Designing autonomous UAVs, line-follower bots, and micro-controllers.",
      coordinator: "Dr. M. Sundaram",
      membersCount: 210,
      members: ["student3@campuscare.edu"],
      announcements: [
        { id: "ca_3", title: "Arduino & Raspberry Pi Workshop", content: "Free kits provided for first 30 registrants.", date: "2026-07-26" }
      ]
    },
    {
      id: "club_3",
      name: "Green Build Society",
      department: "Civil",
      category: "Environmental",
      description: "Pioneering eco-friendly construction techniques and smart urban planning on campus.",
      coordinator: "Prof. S. Ranganathan",
      membersCount: 110,
      members: [],
      announcements: []
    }
  ],
  lostFound: [
    {
      id: "lf_1",
      title: "Lost Sony WH-1000XM4 Headphones",
      type: "Lost",
      category: "Electronics",
      description: "Black over-ear noise canceling headphones left in Central Library Study Room 2.",
      date: "2026-07-27",
      location: "Central Library Room 2",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
      status: "Claim Requested",
      claims: [
        {
          id: "claim_101",
          studentName: "Ananya Roy",
          studentId: "21CS045",
          proofDescription: "Headphones have a silver scratch on the left ear-cup and come in a grey hard case with a braided aux cable.",
          contactNumber: "+91 98765 43210",
          dateSubmitted: "2026-07-28T10:15:00.000Z",
          status: "Pending",
          adminNotes: ""
        }
      ]
    },
    {
      id: "lf_2",
      title: "Found Keychron K2 Mechanical Keyboard",
      type: "Found",
      category: "Electronics",
      description: "RGB wireless keyboard found on bench outside Computer Center Lab 3.",
      date: "2026-07-28",
      location: "Lab 3 Corridor",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
      status: "Open",
      claims: []
    },
    {
      id: "lf_3",
      title: "Lost Blue Leather Wallet",
      type: "Lost",
      category: "Wallets",
      description: "Contains Student ID (John D.), Metro Card, and cash.",
      date: "2026-07-24",
      location: "North Mess Cafeteria",
      image: "",
      status: "Returned",
      claims: [
        {
          id: "claim_100",
          studentName: "John Doe",
          studentId: "20IT012",
          proofDescription: "Wallet contains my college ID card with name John Doe.",
          contactNumber: "+91 91234 56789",
          dateSubmitted: "2026-07-25T11:00:00.000Z",
          status: "Approved",
          adminNotes: "Identity verified with student ID database."
        }
      ]
    }
  ],
  honoursMinors: [
    {
      id: "hm_1",
      title: "Honours in Artificial Intelligence & Deep Learning",
      type: "Honours",
      offeringDepartment: "CSE",
      eligibleDepartments: ["CSE", "IT", "AI&DS", "AIML"],
      minCGPA: 8.5,
      totalCredits: 18,
      coreCredits: 12,
      projectCredits: 6,
      curriculum: [
        { code: "CSH501", name: "Advanced Neural Networks & Transformers", credits: 3, semester: 5 },
        { code: "CSH601", name: "Computer Vision & Generative AI", credits: 3, semester: 6 },
        { code: "CSH701", name: "Natural Language Processing with LLMs", credits: 3, semester: 7 },
        { code: "CSH702", name: "Reinforcement Learning & Robotics", credits: 3, semester: 7 },
        { code: "CSH801", name: "Capstone AI Capstone Project", credits: 6, semester: 8 }
      ],
      description: "Specialized advanced track for high-performing students aiming for AI research, top tech roles, or graduate studies.",
      regulation: "R2023",
      regulationsPdfUrl: "#",
      announcements: [
        { id: "hma_1", title: "Batch 2023-27 Registration Open", content: "Submit applications before Semester 5 commencement.", date: "2026-07-20" }
      ]
    },
    {
      id: "hm_2",
      title: "Minor in Internet of Things (IoT) & Smart Systems",
      type: "Minor",
      offeringDepartment: "ECE",
      eligibleDepartments: ["CSE", "IT", "AIML", "EEE", "Mechanical", "Civil"],
      minCGPA: 7.5,
      totalCredits: 18,
      coreCredits: 14,
      projectCredits: 4,
      curriculum: [
        { code: "ECM501", name: "Sensors & Embedded Hardware", credits: 4, semester: 5 },
        { code: "ECM601", name: "Wireless Sensor Networks & Protocols", credits: 4, semester: 6 },
        { code: "ECM701", name: "Edge Computing & Industrial IoT", credits: 4, semester: 7 },
        { code: "ECM801", name: "Smart City IoT Capstone", credits: 6, semester: 8 }
      ],
      description: "Inter-disciplinary minor degree equipping non-ECE students with smart hardware prototyping and sensor cloud integration skills.",
      regulation: "R2023",
      regulationsPdfUrl: "#",
      announcements: []
    }
  ],
  honoursMinorsApplications: [
    {
      id: "hma_101",
      programId: "hm_1",
      programTitle: "Honours in Artificial Intelligence & Deep Learning",
      studentName: "Aditya Verma",
      studentId: "22CSE104",
      department: "CSE",
      cgpa: 8.92,
      completedCredits: 84,
      status: "Approved",
      dateSubmitted: "2026-07-21T09:30:00.000Z"
    }
  ],
  syllabus: [
    {
      id: "syl_1",
      code: "CS3501",
      name: "Database Management Systems",
      department: "CSE",
      regulation: "R2023",
      semester: 5,
      credits: 4,
      objectives: [
        "To understand relational database concepts and SQL data manipulation.",
        "To master normalization techniques to reduce database redundancy.",
        "To study transaction processing, ACID properties, and concurrency control."
      ],
      courseOutcomes: [
        "CO1: Design entity-relationship diagrams for real-world enterprise applications.",
        "CO2: Write complex SQL queries, joins, subqueries, and stored procedures.",
        "CO3: Apply 3NF and BCNF normalization rules to optimize relational schemas.",
        "CO4: Implement transaction isolation levels and deadlock handling.",
        "CO5: Analyze NoSQL document databases and indexing strategies."
      ],
      units: [
        { unitNumber: 1, title: "Introduction & Relational Model", content: "Data Models, Database System Architecture, ER Diagrams, Relational Algebra, Tuple Relational Calculus." },
        { unitNumber: 2, title: "SQL & Query Processing", content: "DDL, DML, DCL commands, Joins, Nested Subqueries, Triggers, Views, Query Optimization trees." },
        { unitNumber: 3, title: "Database Design & Normalization", content: "Functional Dependencies, Armstrong Axioms, 1NF, 2NF, 3NF, BCNF, Multivalued Dependencies (4NF)." },
        { unitNumber: 4, title: "Transaction Management & Concurrency", content: "ACID properties, Serializability, Two-Phase Locking (2PL), Timestamp Ordering, Deadlock Prevention." },
        { unitNumber: 5, title: "Storage, Indexing & NoSQL", content: "RAID levels, B+ Trees, Hashing, MongoDB document models, CAP theorem, Distributed databases." }
      ],
      textbooks: [
        "Silberschatz, Korth, and Sudarshan, 'Database System Concepts', 7th Edition, McGraw-Hill, 2020.",
        "Ramez Elmasri and Shamkant B. Navathe, 'Fundamentals of Database Systems', 7th Edition, Pearson, 2017."
      ],
      referenceBooks: [
        "Raghu Ramakrishnan and Johannes Gehrke, 'Database Management Systems', 3rd Edition, McGraw-Hill, 2014."
      ],
      pdfUrl: "#"
    },
    {
      id: "syl_2",
      code: "AI3401",
      name: "Machine Learning Algorithms",
      department: "AIML",
      regulation: "R2023",
      semester: 4,
      credits: 4,
      objectives: [
        "Understand fundamental supervised and unsupervised learning algorithms.",
        "Evaluate machine learning models using precision, recall, ROC-AUC metrics."
      ],
      courseOutcomes: [
        "CO1: Implement linear regression and logistic classification models.",
        "CO2: Construct decision trees, random forests, and gradient boosting algorithms.",
        "CO3: Apply K-means and DBSCAN clustering on high-dimensional data.",
        "CO4: Tune hyper-parameters using GridSearch cross-validation.",
        "CO5: Build neural networks using PyTorch / TensorFlow."
      ],
      units: [
        { unitNumber: 1, title: "Supervised Learning Fundamentals", content: "Linear Regression, Gradient Descent, Ridge & Lasso Regularization, Logistic Regression." },
        { unitNumber: 2, title: "Tree Models & Ensembles", content: "Decision Trees, Entropy, Information Gain, Random Forests, AdaBoost, XGBoost." },
        { unitNumber: 3, title: "Support Vector Machines & Kernel Methods", content: "Hyperplanes, Soft Margin SVM, Radial Basis Function (RBF) Kernels." },
        { unitNumber: 4, title: "Unsupervised Learning & Dimensionality Reduction", content: "K-Means, Hierarchical Clustering, Principal Component Analysis (PCA), t-SNE." },
        { unitNumber: 5, title: "Neural Networks & Evaluation", content: "Perceptrons, Backpropagation, Loss Functions, Overfitting, Confusion Matrices, ROC curves." }
      ],
      textbooks: [
        "Tom M. Mitchell, 'Machine Learning', McGraw-Hill, 2013.",
        "Ethem Alpaydin, 'Introduction to Machine Learning', 4th Edition, MIT Press, 2020."
      ],
      referenceBooks: [
        "Christopher M. Bishop, 'Pattern Recognition and Machine Learning', Springer, 2011."
      ],
      pdfUrl: "#"
    }
  ],
  facilities: [
    {
      id: "fac_1",
      name: "Library Group Study Room 1",
      type: "Study Room",
      capacity: 6,
      status: "Available",
      bookings: []
    },
    {
      id: "fac_2",
      name: "Library Silent Pod",
      type: "Study Room",
      capacity: 1,
      status: "Booked",
      bookings: [
        { timeSlot: "10:00 - 12:00", bookedBy: "Alice H.", date: new Date().toISOString() }
      ]
    }
  ],
  cafeteria: [
    {
      id: "cafe_1",
      name: "North Indian Mess",
      crowdStatus: "High",
      menu: {
        breakfast: "Aloo Paratha, Curd, Pickle, Tea/Coffee",
        lunch: "Rajma Chawal, Paneer Tikka Masala, Roti, Mixed Veg, Boondi Raita, Gulab Jamun",
        dinner: "Dal Makhani, Butter Naan, Kadai Paneer, Jeera Rice, Salad"
      },
      updatedAt: new Date().toISOString()
    }
  ]
};

function readDB() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    let modified = false;

    // Ensure all collections exist in database
    Object.keys(defaultData).forEach((key) => {
      if (!data[key]) {
        data[key] = defaultData[key];
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    }
    return data;
  } catch (err) {
    console.error("Error reading database, resetting to default:", err);
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

function writeDB(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
