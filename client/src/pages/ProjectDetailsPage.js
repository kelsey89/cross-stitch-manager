// client/src/pages/ProjectDetailsPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetails from '../components/ProjectDetails';

export default function ProjectDetailsPage({
  fetchFn,
  globalOnAddThread
}) {
  const { projectId } = useParams();

  return (
    <ProjectDetails
      projectId={Number(projectId)}
      fetchFn={fetchFn}
      globalOnAddThread={globalOnAddThread}
    />
  );
}
