import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Images,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Plane,
  Radar,
  Send,
  Share2,
  X,
} from "lucide-react";
import activitiesData from "./data/activities.json";
import calendarData from "./data/calendar.json";
import homeData from "./data/home.json";
import joinData from "./data/join.json";
import pastEventsData from "./data/pastEvents.json";
import siteSettingsData from "./data/siteSettings.json";
import sponsorsData from "./data/sponsors.json";
import teamData from "./data/team.json";

// Main public website component. The editable content comes from JSON files in
// src/data so Pages CMS can update text, links, images, events, team members, and sponsors.
const contactFormEndpoint = import.meta.env.VITE_CONTACT_FORM_ENDPOINT;
const { club, navItems } = siteSettingsData;
const { bannerImage = "/panorama.webp", focusAreas, stats } = homeData;
const { sponsors } = sponsorsData;
const { activities } = activitiesData;
const { calendar } = calendarData;
const { executiveTeam, generalCommittee } = teamData;
const { pastEvents } = pastEventsData;
const { benefits } = joinData;

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-header">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {text && <span>{text}</span>}
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <a className="social-link" href={href} target="_blank" rel="noreferrer">
      <Icon size={18} />
      {label}
    </a>
  );
}

function SponsorLogo({ mark, name, logo }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo]);

  if (failed) {
    return <span className="sponsor-mark">{mark}</span>;
  }

  return <img className="sponsor-logo" src={logo} alt={`${name} logo`} onError={() => setFailed(true)} />;
}

function PageHero({ eyebrow, title, text, action, onAction }) {
  return (
    <section className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="hero-copy">{text}</p>
      {action && (
        <button className="primary" type="button" onClick={onAction}>
          {action} <ArrowRight size={18} />
        </button>
      )}
    </section>
  );
}

function getNextEvent(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .map(({ date, title, location, time, price, isoDate }) => ({
      date,
      title,
      location,
      time,
      price,
      isoDate,
      startsAt: isoDate ? new Date(`${isoDate}T00:00:00`) : null,
    }))
    .filter((event) => event.startsAt && event.startsAt >= today)
    .sort((a, b) => a.startsAt - b.startsAt);

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  const unscheduled = events.find((event) => event.date === "TBA");
  if (unscheduled) {
    return { ...unscheduled, startsAt: null };
  }

  return { ...events[0], startsAt: null };
}

export default function App() {
  const [page, setPage] = useState("home");
  const [activeTarget, setActiveTarget] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState("");

  const nextEvent = useMemo(() => getNextEvent(calendar), []);

  function navigate(target) {
    if (target.startsWith("#")) {
      setPage("home");
      setActiveTarget(target);
      window.setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } else {
      setPage(target);
      setActiveTarget(target);
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
    }
    setMenuOpen(false);
  }

  async function handleContact(event) {
    event.preventDefault();
    setContactStatus("Sending your message...");

    const form = new FormData(event.currentTarget);
    const name = form.get("name");
    const email = form.get("email");
    const message = form.get("message");

    if (contactFormEndpoint) {
      try {
        const response = await fetch(contactFormEndpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: form,
        });

        if (!response.ok) {
          throw new Error("The contact service could not send the message.");
        }

        event.currentTarget.reset();
        setContactStatus("Thanks, your message has been sent to AESA.");
        return;
      } catch (error) {
        setContactStatus("We could not send that through the site. Opening your email app instead.");
      }
    }

    const subject = encodeURIComponent(`AESA enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${club.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="site-shell">
      <Header activeTarget={activeTarget} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
      {menuOpen && <MobileNav navigate={navigate} />}

      <main>
        {page === "home" && <HomePage stats={stats} nextEvent={nextEvent} navigate={navigate} handleContact={handleContact} contactStatus={contactStatus} />}
        {page === "activities" && <ActivitiesPage navigate={navigate} />}
        {page === "team" && <TeamPage />}
        {page === "past" && <PastPage />}
        {page === "join" && <JoinPage />}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

function Header({ activeTarget, menuOpen, setMenuOpen, navigate }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => navigate("home")} aria-label="Go to home">
        <span className="brand-mark">
          <img src="/AESALONG.png" alt="AESA logo" />
        </span>
        <span>
          <strong>{club.shortName}</strong>
          <small>RMIT Aerospace</small>
        </span>
      </button>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map(({ label, target }) => (
          <button className={target === activeTarget ? "active" : ""} key={target} type="button" onClick={() => navigate(target)}>
            {label}
          </button>
        ))}
      </nav>

      <button className="primary small" type="button" onClick={() => navigate("join")}>
        Join
      </button>

      <button
        className="menu-button"
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function MobileNav({ navigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map(({ label, target }) => (
        <button key={target} type="button" onClick={() => navigate(target)}>
          {label}
        </button>
      ))}
    </nav>
  );
}

function HomePage({ stats, nextEvent, navigate, handleContact, contactStatus }) {
  return (
    <>
      <section className="welcome-scroll" aria-label="Welcome to AESA official website">
        <div
          className="welcome-image"
          aria-hidden="true"
          style={{ "--welcome-image": `url("${bannerImage}")` }}
        />
        <motion.div
          className="welcome-copy"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
        
          <h1><span><b>AESA</b></span></h1>
        </motion.div>
      </section>

      <section className="hero editorial-hero" id="home">
        <motion.div className="hero-statement" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow">
            <Radar size={18} />
            RMIT aerospace student association
          </p>
          <h1 className="home-title">AESA is taking aerospace students beyond the lecture hall.</h1>
          <p className="hero-copy">
            A student-run club providing social and professional development opportunities for aerospace
            students at RMIT.
          </p>
          <div className="focus-strip" aria-label="AESA focus areas">
            {focusAreas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
          <div className="hero-actions">
            <button className="primary" type="button" onClick={() => navigate("join")}>
              Join AESA <ArrowRight size={18} />
            </button>
            <button className="secondary" type="button" onClick={() => navigate("#calendar")}>
              View calendar <CalendarDays size={18} />
            </button>
          </div>
          <div className="social-row">
            <SocialLink href={club.socials.facebook} icon={Share2} label="Facebook" />
            <SocialLink href={club.socials.instagram} icon={Images} label="Instagram" />
            <SocialLink href={club.socials.linkedin} icon={BriefcaseBusiness} label="LinkedIn" />
            <SocialLink href={club.socials.rubric} icon={MessageCircle} label="Rubric" />
          </div>
        </motion.div>

        <motion.div
          className="mission-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="mission-card-head">
            <span>Current mission</span>
            <strong>2025-2026</strong>
          </div>
          <div className="mini-orbit" aria-hidden="true">
          <img
               className="plane-wire"
               s src="/Light_Logo_Rev1-removebg-preview.png"
               alt=""
               />
          </div>
          <div className="stats-grid">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mission-note">
            <b>Next checkpoint</b>
            <span>RMIT AESA x Boeing Factory Visit</span>
            <a href={club.socials.rubricEvents} target="_blank" rel="noreferrer">
              View upcoming events on Rubric
            </a>
          </div>
        </motion.div>
      </section>

      <section className="overview-section split-overview">
        <div>
          <a className="section-anchor" href="#overview">
            Overview
          </a>
          <div className="overview-copy" id="overview">
            <p>
              AESA endeavours to provide opportunities for students to improve communication and organisational skills
              while building contacts with industry.
            </p>
            <p>
              The association represents the AIAA RMIT University Student Branch and supports aerospace and aviation
              students through industry events, networking, student leadership, and professional development.
            </p>
          </div>
        </div>
        <aside className="overview-aside">
          <h3>What AESA does</h3>
          <ul>
            <li>Social and professional development for aerospace and aviation students</li>
            <li>Industry contacts through AIN, panels, and networking nights</li>
            <li>AIAA RMIT University Student Branch representation</li>
            <li>Memberships and events through Rubric</li>
          </ul>
        </aside>
      </section>

      <section className="link-board">
        <div className="link-board-title">
          <p className="eyebrow">Navigate</p>
          <h2>Association directory</h2>
        </div>
        <div className="directory-list">
          <button className="directory-row" type="button" onClick={() => navigate("activities")}>
            <CalendarDays />
            <span>
              <b>Activities</b>
              <small>Technical sessions, industry nights, tours, and student showcases</small>
            </span>
            <ArrowRight />
          </button>
          <button className="directory-row" type="button" onClick={() => navigate("team")}>
            <BriefcaseBusiness />
            <span>
              <b>Executive team</b>
              <small>Meet the 2025-2026 committee and leadership roles</small>
            </span>
            <ArrowRight />
          </button>
          <button className="directory-row" type="button" onClick={() => navigate("past")}>
            <Camera />
            <span>
              <b>Past events</b>
              <small>Previous workshops, lab tours, project evenings, and highlights</small>
            </span>
            <ArrowRight />
          </button>
          <button className="directory-row" type="button" onClick={() => navigate("join")}>
            <Send />
            <span>
              <b>Join us</b>
              <small>Open the official Rubric membership and ticketing page</small>
            </span>
            <ArrowRight />
          </button>
        </div>
      </section>

      <CalendarSection navigate={navigate} />
      <SponsorSection />
      <ContactSection handleContact={handleContact} contactStatus={contactStatus} />
    </>
  );
}

function SponsorSection() {
  return (
    <section className="sponsor-section">
      <SectionHeader
        eyebrow="Support network"
        title="Sponsors and collaborators"
        text="AESA public posts mention aerospace, aviation, defence, engineering, and student project organisations involved in industry night programming."
      />
      <div className="sponsor-list">
        {sponsors.map(({ mark, name, href, logo }) => (
          <a href={href} target="_blank" rel="noreferrer" key={name}>
            <SponsorLogo mark={mark} name={name} logo={logo} />
            <span>{name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function CalendarSection({ navigate }) {
  return (
    <section className="band" id="calendar">
      <SectionHeader
        eyebrow="Calendar"
        title="2025-2026 event timeline"
        text="Aerospace Industry Night 2026 was publicly listed for Thursday 7 May, 6:30 PM to 9:30 PM. TBA rows can be replaced with future Rubric events."
      />
      <div className="calendar-list">
        {calendar.map(({ date, title, location, time, price }) => (
          <button className="calendar-row" key={title} type="button" onClick={() => navigate("join")}>
            <strong>{date}</strong>
            <span>
              <b>{title}</b>
              <small>
                <MapPin size={15} /> {location}
              </small>
            </span>
            <span>
              <Clock size={16} /> {time}
            </span>
            <em>{price}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ handleContact, contactStatus }) {
  return (
    <section className="split-section contact" id="contact">
      <div>
        <SectionHeader
          eyebrow="Contact us"
          title="Questions, sponsorships, collaborations"
          text="Contact AESA for memberships, industry partnerships, event ideas, project support, and student enquiries."
        />
        <div className="contact-links">
          <a href={`mailto:${club.email}`}>
            <Mail /> {club.email}
          </a>
          <a href={club.socials.rubric} target="_blank" rel="noreferrer">
            <MessageCircle /> Rubric membership page
          </a>
          <p>
            <MapPin /> {club.location}
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleContact}>
        <input type="hidden" name="_subject" value="AESA website enquiry" />
        <input type="hidden" name="_to" value={club.email} />
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required placeholder="you@email.com" />
        </label>
        <label>
          Message
          <textarea name="message" required placeholder="Tell us what you need..." />
        </label>
        <button className="secondary light" type="submit">
          Email the club <Mail size={18} />
        </button>
        {contactStatus && <p className="form-status">{contactStatus}</p>}
      </form>
    </section>
  );
}

function ActivitiesPage({ navigate }) {
  return (
    <>
      <PageHero
        eyebrow="Activities"
        title="Technical programming for aerospace students"
        text="This page is dedicated to AESA events: practical workshops, industry contact, lab culture, project showcases, and student support."
        action="Join AESA"
        onAction={() => navigate("join")}
      />
      <section className="band">
        <div className="activity-grid">
          {activities.map(({ title, tag, text }) => (
            <button className="activity-card" key={title} type="button" onClick={() => navigate("#calendar")}>
              <span>{tag}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <strong>
                Check calendar <ChevronRight size={16} />
              </strong>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function TeamPage() {
  return (
    <section className="team-page">
      <div className="team-page-header">
        <div>
          <p className="eyebrow">Executive team</p>
          <h1>Meet the AESA committee</h1>
          <p className="hero-copy">
            The student team building aerospace events, industry connections, social programming, and peer support for
            RMIT's aerospace community.
          </p>
        </div>
        <a className="team-header-action" href={club.socials.rubric} target="_blank" rel="noreferrer">
          Join AESA <ArrowRight size={17} />
        </a>
      </div>

      <div className="team-members-panel">
        <TeamSection title="Executive Committee" members={executiveTeam} category="Executive" />
        <TeamSection title="General Committee" members={generalCommittee} category="Committee" />
      </div>
    </section>
  );
}

function TeamSection({ title, members, category }) {
  return (
    <section className="team-subsection">
      <h2>{title}</h2>
      <div className="team-member-grid">
        {members.map((member) => {
          const normalizedMember = normalizeTeamMember(member);

          return <TeamMemberBlock member={{ ...normalizedMember, category }} key={`${category}-${normalizedMember.name}`} />;
        })}
      </div>
    </section>
  );
}

function TeamMemberBlock({ member }) {
  const { name, pronouns, role, photo, photoFit, photoX, photoY, photoZoom, category } = member;

  return (
    <article className="team-member-block">
      <div className="team-avatar">
        {photo ? (
          <img
            src={photo}
            alt={name}
            style={{
              objectFit: "cover",
             objectPosition: "center center",
              transform: `scale(${photoZoom || "1"})`
          }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      <span className="team-role-badge">
       <BriefcaseBusiness size={12} />
       {role}
      </span>
      <h3>{name}</h3>
      {pronouns && <small className="team-pronouns">{pronouns}</small>}
    </article>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function TeamBranch({ title, members }) {
  return (
    <section className="team-branch">
      <h2>{title}</h2>
      <div className="team-grid">
        {members.map((member) => {
          const { name, pronouns, role, text, photo } = normalizeTeamMember(member);
          const photoFit = member.photoFit || "cover";
          const photoX = member.photoX ?? 50;
          const photoY = member.photoY ?? 50;
          const photoZoom = member.photoZoom || member.photoScale || "1";

          return (
            <article className="team-card" key={`${title}-${name}`}>
              {photo && (
                <div className="team-photo-frame">
                  <img
                    className="team-photo"
                    src={photo}
                    alt={name}
                    style={{ objectFit: photoFit, objectPosition: `${photoX}% ${photoY}%`, transform: `scale(${photoZoom})` }}
                  />
                </div>
              )}
              <h3>
                {name}
                {pronouns && <small>{pronouns}</small>}
              </h3>
              <p>{role}</p>
              {text && <span>{text}</span>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function normalizeTeamMember(member) {
  if (!Array.isArray(member)) {
    return { photoFit: "cover", photoX: 50, photoY: 50, photoZoom: "1", ...member };
  }

  if (member.length >= 5) {
    const [name, pronouns, role, text, photo] = member;
    return { name, pronouns, role, text, photo };
  }

  if (member.length === 4) {
    const [name, role, text, photo] = member;
    return { name, pronouns: "", role, text, photo };
  }

  const [name, role, photo] = member;
  return { name, pronouns: "", role, text: "", photo };
}

function PastPage() {
  return (
    <>
      <PageHero
        eyebrow="Past activities"
        title="Previous engineering nights and highlights"
        text="A separate gallery-style page for workshops, lab tours, showcases, and event recaps."
      />
      <section className="band">
        <div className="past-grid">
          {pastEvents.map((event) => (
            <a className="past-card" href={club.socials.instagram} target="_blank" rel="noreferrer" key={event.title}>
              <img src={event.image} alt={event.title} />
              <div>
                <span>
                  <Camera size={15} /> {event.year}
                </span>
                <h3>{event.title}</h3>
                <p>{event.text}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function JoinPage() {
  return (
    <section className="split-section page-split">
      <div>
        <SectionHeader
          eyebrow="Join us"
          title="Become an AESA member this semester"
          text="Join the RMIT aerospace student community for technical events, industry access, project support, and peer connection."
        />
        <div className="benefits">
          {benefits.map((benefit) => (
            <p key={benefit}>
              <CheckCircle2 size={19} /> {benefit}
            </p>
          ))}
        </div>
      </div>

      <div className="join-actions-panel">
        <a className="primary" href={club.socials.rubric} target="_blank" rel="noreferrer">
          Open AESA on Rubric <ArrowRight size={18} />
        </a>
        <a className="secondary" href={club.socials.linkedin} target="_blank" rel="noreferrer">
          Open AESA LinkedIn <ArrowRight size={18} />
        </a>
        <p>Memberships, tickets, and live event registration are handled through AESA's official Rubric page.</p>
      </div>
    </section>
  );
}

function Footer({ navigate }) {
  return (
    <footer>
      <div>
        <strong>{club.name}</strong>
        <span>RMIT aerospace engineering student association</span>
      </div>
      <div>
        {navItems.slice(0, 5).map(({ label, target }) => (
          <button key={target} type="button" onClick={() => navigate(target)}>
            {label}
          </button>
        ))}
      </div>
    </footer>
  );
}
