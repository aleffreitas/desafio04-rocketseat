import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <Header />

      <main>
        <article>
          {router.isFallback ? (
            <div>Carregando...</div>
          ) : (
            <>
              <div>
                <h1>{post.data.title}</h1>
                <div>
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <span>{post.data.author}</span>
                  <span>4 min</span>
                </div>
              </div>
              {post.data.content.map(content => {
                return (
                  <section key={content.heading}>
                    <h2>{content.heading}</h2>
                    {content.body.map(text => {
                      return <p key={text.text}>{text.text}</p>;
                    })}
                  </section>
                );
              })}
            </>
          )}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const response = posts.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    paths: [
      { params: { slug: response[0].uid } },
      { params: { slug: response[1].uid } },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const { slug } = context.params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
