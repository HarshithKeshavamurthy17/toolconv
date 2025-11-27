import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Github, Linkedin, Mail, Send, Sparkles, ArrowUpRight, Zap } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';

const socials = [
  {
    ariaLabel: 'GitHub - View my code',
    href: 'https://github.com/HarshithKeshavamurthy17',
    label: 'GitHub',
    icon: Github,
    gradient: 'from-purple-500 to-pink-500',
    bg: 'from-purple-500/10 to-pink-500/5',
  },
  {
    ariaLabel: 'LinkedIn - Connect',
    href: 'https://www.linkedin.com/in/harshith-k-bu/',
    label: 'LinkedIn',
    icon: Linkedin,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-500/10 to-cyan-500/5',
  },
  {
    ariaLabel: 'Email - Message me',
    href: 'mailto:hk17@bu.edu',
    label: 'hk17@bu.edu',
    icon: Mail,
    gradient: 'from-emerald-500 to-green-500',
    bg: 'from-emerald-500/10 to-green-500/5',
  },
];

export function Contact() {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    // EmailJS configuration
    // Service ID: portfolio
    // Template ID: template_qzzopjr
    // Public Key: mvQtUQ4jn5hXPHPY4
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'portfolio';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_qzzopjr';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mvQtUQ4jn5hXPHPY4';

    // Initialize EmailJS
    emailjs.init(publicKey);

    try {
      await emailjs.send(serviceId, templateId, {
        from_name: name,
        from_email: email,
        name: name, // For template compatibility
        message: message,
        to_email: 'hk17@bu.edu',
        reply_to: email,
      });

      setSubmitStatus('success');
      form.reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus('error');
      
      // Fallback to mailto: if EmailJS fails
      const subject = encodeURIComponent(`Portfolio Contact: ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.location.href = `mailto:hk17@bu.edu?subject=${subject}&body=${body}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-6 md:py-8 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute right-[10%] top-[20%] size-[350px] rounded-full bg-gradient-to-br from-cyan-500/15 to-transparent blur-3xl" />

      <div className="mx-auto max-w-5xl px-3 md:px-5 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-center"
        >
          <motion.div
            className="mb-2 inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-500/5 px-2.5 py-1 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="size-2.5 text-cyan-400" />
            <span className="text-[10px] font-medium text-cyan-300">Let's connect</span>
          </motion.div>
          
          <h2 className="mb-2 text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="mx-auto max-w-2xl text-xs text-neutral-400">
            Have a project in mind or want to collaborate? Let's build something amazing together!
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            onMouseMove={handleMouseMove}
            className="group relative"
          >
            {/* Spotlight */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: useTransform(
                  [mouseX, mouseY],
                  ([x, y]) =>
                    `radial-gradient(600px circle at ${x}px ${y}px, rgba(34, 211, 238, 0.15), transparent 40%)`
                ),
              }}
            />

            <form
              onSubmit={handleSubmit}
              className="relative space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl"
            >
              {['name', 'email', 'message'].map((field, i) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="space-y-2"
                >
                  <label htmlFor={field} className="block text-sm font-semibold text-neutral-300 capitalize">
                    Your {field}
                  </label>
                  {field === 'message' ? (
                    <textarea
                      id={field}
                      name={field}
                      required
                      rows={5}
                      onFocus={() => setFocusedField(field)}
                      onBlur={() => setFocusedField(null)}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="Tell me about your project..."
                    />
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      name={field}
                      required
                      onFocus={() => setFocusedField(field)}
                      onBlur={() => setFocusedField(null)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      placeholder={field === 'email' ? 'john@example.com' : 'John Doe'}
                    />
                  )}
                </motion.div>
              ))}

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
                >
                  ✓ Message sent successfully! I'll get back to you soon.
                </motion.div>
              )}
              
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  ⚠ Email service unavailable. Opening your email client as fallback...
                </motion.div>
              )}

              <MagneticButton strength={0.3}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <motion.div
                      animate={isSubmitting ? { rotate: 360 } : { x: [0, 5, 0] }}
                      transition={isSubmitting ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 1.5, repeat: Infinity }}
                    >
                      <Send className="size-5" />
                    </motion.div>
                  </span>
                </motion.button>
              </MagneticButton>
            </form>
          </motion.div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-xl font-bold text-white">Connect</h3>
              {socials.map((social, index) => {
                // Email is display-only, not clickable
                if (social.label === 'hk17@bu.edu') {
                  return (
                    <motion.div
                      key={social.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${social.bg} p-4 backdrop-blur-sm cursor-default`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${social.bg}`}>
                          <social.icon className={`size-5 bg-gradient-to-br ${social.gradient} bg-clip-text text-transparent`} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{social.label}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                
                // Other social links are clickable
                return (
                  <MagneticButton key={social.label} strength={0.2}>
                    <motion.a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.03, x: 5 }}
                      className={`flex items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${social.bg} p-4 backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${social.bg}`}>
                          <social.icon className={`size-5 bg-gradient-to-br ${social.gradient} bg-clip-text text-transparent`} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{social.label}</div>
                        </div>
                      </div>
                      <ArrowUpRight className={`size-5 bg-gradient-to-br ${social.gradient} bg-clip-text text-transparent`} />
                    </motion.a>
                  </MagneticButton>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="mb-3 size-8 text-violet-400" />
              </motion.div>
              <h3 className="mb-2 text-lg font-bold text-white">Open to Opportunities</h3>
              <p className="text-sm text-neutral-300">
                Seeking Data Engineering, AI/ML, and Data Science roles. Let's build something great!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
