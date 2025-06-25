// client/src/pages/ProjectPage.js

import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import ProjectDetails from '../components/ProjectDetails';
import { Row, Col } from 'react-bootstrap';

export default function ProjectPage({
  projects,
  onCreate,
  onDeleteProject,
  fetchFn,
  globalOnAddThread
}) {
  const { id } = useParams();
  const projectId = id ? Number(id) : null;

  return (
    <>
      <h2>Projects</h2>
      <ProjectForm onCreate={onCreate} fetchFn={fetchFn} />

      <Row>
        <Col md={4}>
          <ProjectList
            projects={projects}
            selectedId={projectId}
            onSelect={() => {}}      // navigation now handled by Link
            onDelete={onDeleteProject}
          />
        </Col>
        <Col md={8}>
          {projectId
            ? <ProjectDetails
                projectId={projectId}
                fetchFn={fetchFn}
                globalOnAddThread={globalOnAddThread}
              />
            : <p>Select a project from the list or click on a card in Home.</p>
          }
        </Col>
      </Row>
    </>
  );
}
