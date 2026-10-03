import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Structured audits',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Every reporting article is read against its Contraarguments, Fallacies,
        Evidences, Sources, and Interpretations — a typed audit of each claim,
        not a pile of comments.
      </>
    ),
  },
  {
    title: 'On-chain attestations',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Audit items and reports are pinned to IPFS, signed by a wallet, and
        attested on-chain. Attestation counts and per-wallet provenance are
        readable from the contract events.
      </>
    ),
  },
  {
    title: 'Search, filter, provenance',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Full-text and vector search embeddings in MongoDB, format/label/date
        filters on the reporting column, and a per-wallet provenance timeline
        on <code>/debate/provenance</code>.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
