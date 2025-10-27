"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DetailView from "../components/DetailView";

// 模拟详情数据 - 后期可以替换为CMS数据
const detailData = {
  "constraint": {
    id: "constraint",
    title: "CONSTRAINT",
    description: "AI stalls – scaled and common, but no gains in accuracy, reliability, training, or efficiency.",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "In the CONSTRAINT future, AI development hits a plateau. While AI systems become widespread and commonly used, they fail to deliver significant improvements in accuracy, reliability, training efficiency, or overall performance. This scenario represents a world where AI adoption is high, but innovation stagnates.",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "2:45"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "Demand for compute remains high, fueling a ramp in chip production",
            icon: "chip",
            trend: "up"
          },
          {
            title: "AI costs continue along downward trajectory", 
            icon: "money",
            trend: "down"
          },
          {
            title: "Government investment fuels sustained research",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "Focus on operational efficiency over innovation",
          "Invest in proven AI applications",
          "Build robust data infrastructure",
          "Develop human-AI collaboration frameworks"
        ]
      }
    }
  },
  "growth": {
    id: "growth",
    title: "GROWTH",
    description: "Barriers drop; AI is everywhere, driving mostly positive business and social impact.",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "The GROWTH future represents a world where AI barriers fall away, and artificial intelligence becomes ubiquitous across all sectors. This scenario is characterized by widespread positive impact on both business and society, with AI driving innovation, efficiency, and improved quality of life.",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "3:12"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "AI becomes accessible to small businesses and individuals",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "Regulatory frameworks enable rapid AI adoption",
            icon: "shield",
            trend: "up"
          },
          {
            title: "AI-human collaboration becomes seamless",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "Embrace AI-first business models",
          "Invest in AI talent and training",
          "Build ethical AI frameworks",
          "Create AI-powered customer experiences"
        ]
      }
    }
  },
  // Transform - All Industries
  "transform": {
    id: "transform",
    title: "TRANSFORM",
    description: "Progress in AI for the last 5 years has exceeded expectations in almost every dimension.",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Collapse - All Industries
  "collapse": {
    id: "collapse",
    title: "COLLAPSE",
    description: "AI fundamentally changes how we work, live, and interact with technology.",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Consumer Products - Constraint
  "constraint-cp": {
    id: "constraint-cp",
    title: "CONSTRAINT",
    description: "Consumer AI products plateau with limited innovation and user adoption challenges.",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Consumer Products Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Consumer Products - Growth
  "growth-cp": {
    id: "growth-cp",
    title: "GROWTH",
    description: "AI-powered consumer products become mainstream, enhancing daily life experiences.",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Consumer Products Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Consumer Products - Transform
  "transform-cp": {
    id: "transform-cp",
    title: "TRANSFORM",
    description: "Consumer products are completely reimagined with AI at their core.",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Consumer Products Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Consumer Products - Collapse
  "collapse-cp": {
    id: "collapse-cp",
    title: "COLLAPSE",
    description: "AI collapses traditional consumer product categories and creates new markets.",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Consumer Products Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Industrial Products - Constraint
  "constraint-ip": {
    id: "constraint-ip",
    title: "CONSTRAINT",
    description: "[Enter description]",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Industrial Products Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Industrial Products - Growth
  "growth-ip": {
    id: "growth-ip",
    title: "GROWTH",
    description: "[Enter description]",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Industrial Products Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Industrial Products - Transform
  "transform-ip": {
    id: "transform-ip",
    title: "TRANSFORM",
    description: "[Enter description]",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Industrial Products Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Industrial Products - Collapse
  "collapse-ip": {
    id: "collapse-ip",
    title: "COLLAPSE",
    description: "[Enter description]",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Industrial Products Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Oil & Gas - Constraint
  "constraint-og": {
    id: "constraint-og",
    title: "CONSTRAINT",
    description: "[Enter description]",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Oil & Gas Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Oil & Gas - Growth
  "growth-og": {
    id: "growth-og",
    title: "GROWTH",
    description: "[Enter description]",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Oil & Gas Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Oil & Gas - Transform
  "transform-og": {
    id: "transform-og",
    title: "TRANSFORM",
    description: "[Enter description]",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Oil & Gas Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Oil & Gas - Collapse
  "collapse-og": {
    id: "collapse-og",
    title: "COLLAPSE",
    description: "[Enter description]",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Oil & Gas Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Defense - Constraint
  "constraint-d": {
    id: "constraint-d",
    title: "CONSTRAINT",
    description: "[Enter description]",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Defense Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Defense - Growth
  "growth-d": {
    id: "growth-d",
    title: "GROWTH",
    description: "[Enter description]",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Defense Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Defense - Transform
  "transform-d": {
    id: "transform-d",
    title: "TRANSFORM",
    description: "[Enter description]",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Defense Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Defense - Collapse
  "collapse-d": {
    id: "collapse-d",
    title: "COLLAPSE",
    description: "[Enter description]",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Defense Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Banking & Capital Markets - Constraint
  "constraint-bcm": {
    id: "constraint-bcm",
    title: "CONSTRAINT",
    description: "[Enter description]",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Banking & Capital Markets Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Banking & Capital Markets - Growth
  "growth-bcm": {
    id: "growth-bcm",
    title: "GROWTH",
    description: "[Enter description]",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Banking & Capital Markets Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Banking & Capital Markets - Transform
  "transform-bcm": {
    id: "transform-bcm",
    title: "TRANSFORM",
    description: "[Enter description]",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Banking & Capital Markets Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Banking & Capital Markets - Collapse
  "collapse-bcm": {
    id: "collapse-bcm",
    title: "COLLAPSE",
    description: "[Enter description]",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Banking & Capital Markets Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Retail - Constraint
  "constraint-r": {
    id: "constraint-r",
    title: "CONSTRAINT",
    description: "[Enter description]",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Retail Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Retail - Growth
  "growth-r": {
    id: "growth-r",
    title: "GROWTH",
    description: "[Enter description]",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Retail Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Retail - Transform
  "transform-r": {
    id: "transform-r",
    title: "TRANSFORM",
    description: "[Enter description]",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Retail Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Retail - Collapse
  "collapse-r": {
    id: "collapse-r",
    title: "COLLAPSE",
    description: "[Enter description]",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Retail Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Life Sciences - Constraint
  "constraint-ls": {
    id: "constraint-ls",
    title: "CONSTRAINT",
    description: "[Enter description]",
    color: "#750D5D",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Life Sciences Constraint]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Life Sciences - Growth
  "growth-ls": {
    id: "growth-ls",
    title: "GROWTH",
    description: "[Enter description]",
    color: "#2BB856",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Life Sciences Growth]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "accessibility",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "shield",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "collaboration",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Life Sciences - Transform
  "transform-ls": {
    id: "transform-ls",
    title: "TRANSFORM",
    description: "[Enter description]",
    color: "#198CE6",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Life Sciences Transform]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "up"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "up"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "up"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  },
  // Life Sciences - Collapse
  "collapse-ls": {
    id: "collapse-ls",
    title: "COLLAPSE",
    description: "[Enter description]",
    color: "#FF4136",
    content: {
      about: {
        title: "About This Future",
        description: "[Enter description for Life Sciences Collapse]",
        video: {
          thumbnail: "/images/video_thumbnail.jpg",
          duration: "0:00"
        }
      },
      forces: {
        title: "Forces of Change",
        items: [
          {
            title: "[Enter force 1]",
            icon: "chip",
            trend: "down"
          },
          {
            title: "[Enter force 2]", 
            icon: "money",
            trend: "down"
          },
          {
            title: "[Enter force 3]",
            icon: "building",
            trend: "down"
          }
        ]
      },
      strategicPlays: {
        title: "Strategic Plays",
        items: [
          "[Enter strategic play 1]",
          "[Enter strategic play 2]",
          "[Enter strategic play 3]",
          "[Enter strategic play 4]"
        ]
      }
    }
  }
};

export default function FutureDetailPage({ params }) {
  const router = useRouter();
  const { futureId } = React.use(params);
  
  const futureData = detailData[futureId];

  if (!futureData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Future not found</h1>
          <button 
            onClick={() => router.push('/futures')}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Back to Futures
          </button>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    // 从 futureId 提取版本，例如 "transform-og" -> "oil-gas"
    let versionId = 'all-industries'; // 默认值
    
    if (futureId.includes('-cp')) versionId = 'consumer-products';
    else if (futureId.includes('-ip')) versionId = 'industrial-products';
    else if (futureId.includes('-og')) versionId = 'oil-gas';
    else if (futureId.includes('-d')) versionId = 'defense';
    else if (futureId.includes('-bcm')) versionId = 'banking-capital-markets';
    else if (futureId.includes('-r')) versionId = 'retail';
    else if (futureId.includes('-ls')) versionId = 'life-sciences';
    
    router.push(`/futures?version=${versionId}#${futureId}`);
  };

  return (
    <DetailView 
      future={futureData}
      onClose={handleClose}
    />
  );
}
