"use client";
import React, { useState } from 'react';
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";

const EventsPage = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);


  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Events page provides comprehensive management of platform events, activities, and special occasions. Create, monitor, and manage events to engage users and drive platform activity.",
      subsections: [
        {
          title: "Event Creation",
          content: "Create and configure various types of events including sales, promotions, and special activities"
        },
        {
          title: "Event Monitoring",
          content: "Track event performance, participation rates, and engagement metrics"
        },
        {
          title: "Event Management",
          content: "Manage active events, update details, and coordinate event activities"
        }
      ]
    },
    {
      title: "Event Types",
      content: "Understanding different event categories:",
      subsections: [
        {
          title: "Sales Events",
          content: "Flash sales, seasonal promotions, and discount campaigns"
        },
        {
          title: "Product Launches",
          content: "New product introductions and feature announcements"
        },
        {
          title: "Community Events",
          content: "User engagement activities, contests, and community building events"
        },
        {
          title: "System Events",
          content: "Maintenance windows, updates, and platform announcements"
        }
      ]
    },
    {
      title: "Event Management Features",
      content: "Available event management tools:",
      subsections: [
        {
          title: "Event Scheduling",
          content: "Set start and end times, configure recurring events, and manage event calendars"
        },
        {
          title: "Participant Management",
          content: "Track registrations, manage attendee lists, and send event communications"
        },
        {
          title: "Content Management",
          content: "Upload event materials, manage descriptions, and configure event pages"
        },
        {
          title: "Analytics & Reporting",
          content: "Monitor event performance, track engagement, and generate event reports"
        }
      ]
    },
    {
      title: "Event Promotion",
      content: "Effective event marketing strategies:",
      subsections: [
        {
          title: "Notifications",
          content: "Send event announcements, reminders, and updates to users"
        },
        {
          title: "Social Media",
          content: "Integrate with social platforms for broader event promotion"
        },
        {
          title: "Email Campaigns",
          content: "Create targeted email campaigns for event marketing"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Effective event management:",
      subsections: [
        {
          title: "Planning",
          content: "Plan events well in advance with clear objectives and success metrics"
        },
        {
          title: "Communication",
          content: "Maintain clear communication with participants before, during, and after events"
        },
        {
          title: "Follow-up",
          content: "Collect feedback, analyze results, and plan improvements for future events"
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Events
          </h1>
          <p className="text-gray-600 mt-1">Manage platform events and activities</p>
        </div>
        <HelpButton
          onClick={() => setShowHelpModal(true)}
          text="Events Help"
        />
      </div>
      
      {/* Events content will be implemented here */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Events management interface coming soon...</p>
      </div>
      
      {/* Events Management Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Events Management Guide"
        description="Learn how to effectively create, manage, and promote platform events to engage users and drive platform activity."
        sections={helpSections}
      />
    </div>
  )
}

export default EventsPage
