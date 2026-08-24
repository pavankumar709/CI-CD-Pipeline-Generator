import { LANGUAGES } from "./languages.js";

function slug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "job";
}

export function generateGithubActions(jobs) {
  const jobsYaml = jobs
    .map((job) => {
      const lang = LANGUAGES[job.language] || LANGUAGES.none;
      const setup = lang.githubSetup(job.version);
      const stepsYaml = job.steps
        .map((s) => `      - name: ${s.name}\n        run: ${s.command}`)
        .join("\n");
      return `  ${slug(job.name)}:
    name: ${job.name}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
${setup}${stepsYaml}`;
    })
    .join("\n\n");

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
${jobsYaml}
`;
}

export function generateGitlabCI(jobs) {
  const stages = jobs.map((job) => slug(job.name)).join(", ");
  const jobsYaml = jobs
    .map((job) => {
      const lang = LANGUAGES[job.language] || LANGUAGES.none;
      const image = lang.gitlabImage(job.version);
      const script = job.steps.map((s) => `    - ${s.command}`).join("\n");
      return `${slug(job.name)}:
  stage: ${slug(job.name)}
  image: ${image}
  script:
${script || "    - echo \"no steps\""}`;
    })
    .join("\n\n");

  return `stages: [${stages}]

${jobsYaml}
`;
}

export function generateJenkinsfile(jobs) {
  const stages = jobs
    .map((job) => {
      const lang = LANGUAGES[job.language] || LANGUAGES.none;
      const note = lang.jenkinsNote(job.version);
      const innerStages = job.steps
        .map(
          (s) => `                stage('${s.name}') {
                    steps {
                        sh '${s.command}'
                    }
                }`
        )
        .join("\n");
      return `        stage('${job.name}') {
            ${note}
            stages {
${innerStages || "                // no steps"}
            }
        }`;
    })
    .join("\n");

  return `pipeline {
    agent any
    stages {
${stages}
    }
}
`;
}

export const GENERATORS = {
  github: { label: "GitHub Actions", filename: ".github/workflows/ci.yml", generate: generateGithubActions },
  gitlab: { label: "GitLab CI", filename: ".gitlab-ci.yml", generate: generateGitlabCI },
  jenkins: { label: "Jenkins", filename: "Jenkinsfile", generate: generateJenkinsfile },
};
