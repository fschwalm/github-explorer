import React, { useState, FormEvent, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi/';
import { Link } from 'react-router-dom';

import { ReactComponent as Logo } from '../../assets/logo.svg';
import { Title } from '../../components/Title';
import api from '../../services/api';

import { Form, Repositories, Error } from './styles';

interface Repository {
  id: number;
  full_name: string;
  description: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const REPOSITORIES_KEY = '@github-explorer:repositories';

const Dashboard: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    return JSON.parse(localStorage.getItem(REPOSITORIES_KEY) || '') || [];
  });

  useEffect(() => {
    localStorage.setItem(REPOSITORIES_KEY, JSON.stringify(repositories));
  }, [repositories]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!searchText) {
      setErrorMessage('Informe o nome/repo!');
      return;
    }

    try {
      const response = await api.get<Repository>(`/repos/${searchText}`);
      setRepositories([...repositories, response.data]);
      setSearchText('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <>
      <Logo />
      <Title>Explore repositórios no GitHub</Title>

      <Form hasError={!!errorMessage} onSubmit={handleSubmit}>
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          type="text"
          placeholder="Digite o nome do repositório"
        />
        <button type="submit">Pesquisar</button>
      </Form>
      {errorMessage && <Error>{errorMessage}</Error>}

      <Repositories>
        {repositories.map(({ id, owner, full_name, description }) => (
          <Link key={id} to={`/repositories/${full_name}`}>
            <img src={owner.avatar_url} alt={owner.login} />
            <div>
              <strong>{full_name}</strong>
              <p>{description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
