/**
 * Interface for a Subforum object.
 *
 * This interface defines the structure of a subforum in the application.
 * A subforum is a dedicated space for discussions on a specific topic.
 */
export interface Subforum {
  /** Unique identifier for the subforum */
  id: string;

  /** Title of the subforum */
  title: string;

  /** Description of the subforum */
  description: string;

  /** Array of usernames who are moderators of this subforum */
  moderators: string[];

  /** Date when the subforum was created */
  createdAt: Date;

  /** Date when the subforum was last updated */
  updatedAt: Date;

  /** Number of questions in this subforum */
  questionCount?: number;

  /** Tags associated with this subforum */
  tags?: string[];

  /** Rules specific to this subforum */
  rules?: string[];

  /** Whether the subforum is active or archived */
  isActive: boolean;
}

/**
 * Interface for a Subforum object as stored in the database.
 *
 * This extends the base Subforum interface with MongoDB-specific fields.
 */
export interface DatabaseSubforum extends Subforum {
  /** MongoDB ObjectId as string */
  _id: string;
}

/**
 * Interface for creating a new subforum.
 *
 * This includes only the fields required when creating a new subforum.
 */
export interface CreateSubforumRequest extends Request {
  body: {
    /** Title of the subforum */
    title: string;

    /** Description of the subforum */
    description: string;

    /** Array of usernames who are moderators of this subforum */
    moderators: string[];

    /** Tags associated with this subforum (optional) */
    tags?: string[];

    /** Rules specific to this subforum (optional) */
    rules?: string[];
  };
}

/**
 * Interface for updating an existing subforum.
 *
 * This includes fields that can be updated for an existing subforum.
 */
export interface UpdateSubforumRequest {
  /** Title of the subforum (optional) */
  title?: string;

  /** Description of the subforum (optional) */
  description?: string;

  /** Array of usernames who are moderators of this subforum (optional) */
  moderators?: string[];

  /** Tags associated with this subforum (optional) */
  tags?: string[];

  /** Rules specific to this subforum (optional) */
  rules?: string[];

  /** Whether the subforum is active or archived (optional) */
  isActive?: boolean;
}

/**
 * Interface for updating an existing subforum in the database.
 *
 * This includes fields that can be updated for an existing subforum.
 */
export interface DatabaseUpdateSubforumRequest {
  /** Title of the subforum (optional) */
  title?: string;

  /** Description of the subforum (optional) */
  description?: string;

  /** Array of usernames who are moderators of this subforum (optional) */
  moderators?: string[];

  /** Tags associated with this subforum (optional) */
  tags?: string[];

  /** Rules specific to this subforum (optional) */
  rules?: string[];

  /** Whether the subforum is active or archived (optional) */
  isActive?: boolean;

  /** Date when the subforum was last updated */
  updatedAt: Date;
}
