import React from 'react';
import { Assignment } from '@/types';
import { CheckInDetails } from './CheckInDetails';
import { AssignmentCards } from './AssignmentCards';

interface PostCheckInViewProps {
  assignment?: Assignment | null;
  checkinDetails?: {
    gate: string;
    waktu: string;
    petugas: string;
  } | null;
}

export const PostCheckInView: React.FC<PostCheckInViewProps> = ({
  assignment,
  checkinDetails
}) => {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <CheckInDetails details={checkinDetails} />
      <AssignmentCards assignment={assignment} />
    </div>
  );
};

