import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueOption } from './styles';

export default class Repository extends Component {
  constructor() {
    super().state = {
      repository: {},
      issues: [],
      issueState: 'open',
      loading: true,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const { issueState } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleIssueState = async newIssueState => {
    this.setState({ loading: true });
    const { issueState } = this.state;

    if (issueState !== newIssueState) {
      const { match } = this.props;
      const repoName = decodeURIComponent(match.params.repository);

      const { data: issues } = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: newIssueState,
          per_page: 5,
        },
      });

      this.setState({ issues, issueState: newIssueState });
    }

    this.setState({ loading: false });
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.name} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueOption>
          Estado:
          <button type="button" onClick={() => this.handleIssueState('all')}>
            Todas
          </button>
          <button type="button" onClick={() => this.handleIssueState('open')}>
            Em Aberto
          </button>
          <button type="button" onClick={() => this.handleIssueState('closed')}>
            Fechada
          </button>
        </IssueOption>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
