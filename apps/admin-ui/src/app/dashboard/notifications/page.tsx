"use client";
import React, { useState } from 'react';
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";

const NotificationsPage = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);


  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Notifications page provides centralized management of all platform notifications. Monitor system alerts, user communications, and automated messages to ensure effective platform communication.",
      subsections: [
        {
          title: "System Notifications",
          content: "Monitor platform alerts, system status updates, and administrative messages"
        },
        {
          title: "User Communications",
          content: "Manage notifications sent to users, sellers, and administrators"
        },
        {
          title: "Automated Messages",
          content: "Configure and monitor automated email, SMS, and in-app notifications"
        }
      ]
    },
    {
      title: "Notification Types",
      content: "Understanding different notification categories:",
      subsections: [
        {
          title: "System Alerts",
          content: "Critical system events, errors, and maintenance notifications"
        },
        {
          title: "User Notifications",
          content: "Account updates, order confirmations, and user-specific messages"
        },
        {
          title: "Marketing Messages",
          content: "Promotional campaigns, newsletters, and marketing communications"
        },
        {
          title: "Security Alerts",
          content: "Login attempts, security warnings, and account protection messages"
        }
      ]
    },
    {
      title: "Management Features",
      content: "Available notification management tools:",
      subsections: [
        {
          title: "Send Notifications",
          content: "Create and send custom notifications to specific users or groups"
        },
        {
          title: "Templates",
          content: "Manage notification templates for consistent messaging"
        },
        {
          title: "Scheduling",
          content: "Schedule notifications for optimal delivery times"
        },
        {
          title: "Analytics",
          content: "Track delivery rates, open rates, and engagement metrics"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Effective notification management:",
      subsections: [
        {
          title: "Frequency Control",
          content: "Avoid notification fatigue by managing frequency and relevance"
        },
        {
          title: "Personalization",
          content: "Customize notifications based on user preferences and behavior"
        },
        {
          title: "Compliance",
          content: "Ensure notifications comply with privacy laws and user consent"
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">Manage platform notifications and communications</p>
        </div>
        <HelpButton
          onClick={() => setShowHelpModal(true)}
          text="Notifications Help"
        />
      </div>
      
      {/* Notifications content will be implemented here */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Notifications management interface coming soon...</p>
      </div>
      
      {/* Notifications Management Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Notifications Management Guide"
        description="Learn how to effectively manage platform notifications, user communications, and automated messaging systems."
        sections={helpSections}
      />
    </div>
  )
}

export default NotificationsPage