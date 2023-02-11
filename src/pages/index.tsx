import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const newPosts = postsPagination.results;
  const [postLoad, setPostLoad] = useState(newPosts);
  const [next, setNext] = useState(postsPagination.next_page);

  function loadMore() {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        const updatedPost = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              author: post.data.author,
              subtitle: post.data.subtitle,
            },
          };
        });

        newPosts.push(updatedPost[0]);
        setPostLoad(newPosts);
        setNext(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | Space traveling</title>
      </Head>
      <Header />
      <main className={styles.contentContainer}>
        {newPosts.map(post => (
          <section className={styles.posts} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>
            <div>
              <time>
                <AiOutlineCalendar />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FiUser />
                {post.data.author}
              </span>
            </div>
          </section>
        ))}

        {next && (
          <button type="button" onClick={loadMore}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const { next_page } = postsResponse;

  const postsPagination = {
    results,
    next_page,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
