import { Container } from "@/components/Base"
import { BlogItem } from "@/components/Blog/BlogItem"
import Notice from "@/components/Notice"
import styles from "./BlogRoot.module.scss"

export default function BlogMain() {
  const t = "Blog Posts"
  const d = "Sharing my sad, pathetic life to people"
  return (
    <Container title={t} description={d}>
      <header className="mt-24 max-w-screen-2xl mx-auto px-12 2xl:px-0 text-center flex flex-col gap-y-3">
        <Notice content="Blog page still under construction - keep in mind that I self-host everything on the cloud and it's not easy lol" />
        <h1 className="text-4xl lg:text-5xl">{t}</h1>
        <p className="text-base lg:text-lg">{d}</p>
      </header>
      <div className={styles["container"]}>
        <BlogSection title="Recent Posts">
          <BlogItem />
          <BlogItem />
          <BlogItem />
        </BlogSection>
        <BlogSection title="Tech/Programming">
          <BlogItem />
          <BlogItem />
          <BlogItem />
        </BlogSection>
        <BlogSection title="Behind The Scenes">
          <BlogItem />
          <BlogItem />
          <BlogItem />
          <BlogItem />
        </BlogSection>
        <BlogSection title="Others">
          <BlogItem />
          <BlogItem />
          <BlogItem />
        </BlogSection>
      </div>
    </Container>
  )
}
