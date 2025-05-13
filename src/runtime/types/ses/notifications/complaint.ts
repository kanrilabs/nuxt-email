type ComplaintType = 'abuse' | 'auth-failure' | 'fraud' | 'not-spam' | 'other' | 'virus'

interface ComplainedRecipient {
  /**
   * The email address of the recipient.
   */
  emailAddress: string
}

export interface Complaint {
  /**
   * A list that contains information about recipients that may have submitted the complaint.
   */
  complainedRecipients: ComplainedRecipient[]
  /**
   * The date and time, in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ), when the ISP sent the complaint notification.
   */
  timestamp: string
  /**
   * A unique ID for the complaint.
   */
  feedbackId: string
  /**
   * The subtype of the complaint, as determined by Amazon SES.
   */
  complaintSubType?: 'OnAccountSuppressionList' | null
  /**
   * The value of the `User-Agent` field from the feedback report. This indicates the name and version of the system that generated the report.
   */
  userAgent?: string
  /**
   * The value of the `Feedback-Type` field from the feedback report received from the ISP. This contains the type of feedback.
   */
  complaintFeedbackType?: ComplaintType
  /**
   * The value of the `Arrival-Date` or `Received-Date` field from the feedback report in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ). This field may be absent in the report (and therefore also absent in this object).
   */
  arrivalDate?: string
}
