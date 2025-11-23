import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Eye,
  Code,
  Database,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle2,
  BarChart3,
  Cpu,
  Image as ImageIcon,
  Layers,
  Activity,
  Monitor,
  Target,
} from 'lucide-react';

export default function ProjectOncoVision() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 blur-3xl" aria-hidden="true" />
      </div>

      <div className="mx-auto max-w-6xl px-6 space-y-16">
        {/* Hero / Case Study Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
                  Case Study
                </span>
                <Link
                  to="/"
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">OncoVision</h1>
              <p className="text-lg text-neutral-300 max-w-3xl">
                AI-powered medical image segmentation tool that uses deep learning to automatically analyze breast ultrasound images. Built with PyTorch and U-Net architecture, it identifies and classifies different tissue types including benign tumors, malignant tumors, and background tissue. Features a complete end-to-end pipeline from data preprocessing to model deployment with an interactive web application.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Deep Learning', 'Computer Vision', 'Medical AI', 'PyTorch', 'U-Net', 'ResNet50', 'Streamlit', 'Image Segmentation'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <a
                  href="https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-all hover:scale-105 shadow-lg shadow-purple-600/25"
                >
                  <Zap className="size-4" />
                  Try Live Demo
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              icon: <Layers className="size-5 text-purple-300" aria-hidden="true" />,
              title: 'Segmentation Classes',
              value: '3 Classes',
              subtitle: 'Background, Benign, Malignant',
              extra: 'Multi-class pixel-level segmentation with clear tissue type distinction.',
            },
            {
              icon: <Database className="size-5 text-blue-300" aria-hidden="true" />,
              title: 'Training Dataset',
              value: '624 pairs',
              subtitle: 'BUSI dataset (355 benign, 167 malignant, 102 normal)',
              extra: 'Stratified 80/20 train/validation split with comprehensive augmentation.',
            },
            {
              icon: <Brain className="size-5 text-pink-300" aria-hidden="true" />,
              title: 'Model Architecture',
              value: 'U-Net + ResNet50',
              subtitle: 'Transfer learning with pre-trained encoder',
              extra: 'SCSE attention mechanism, combined Dice-Focal loss for class imbalance.',
            },
            {
              icon: <Monitor className="size-5 text-rose-300" aria-hidden="true" />,
              title: 'Web Application',
              value: '156 Examples',
              subtitle: 'Interactive Streamlit demo',
              extra: 'Real-time image upload and processing with color-coded visualizations.',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                {metric.icon}
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{metric.title}</p>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-xs text-neutral-400 mb-2">{metric.subtitle}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{metric.extra}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-column: Problem + Tech Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <Target className="size-6 text-purple-400" aria-hidden="true" />
                Problem
              </h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Medical image analysis, particularly breast ultrasound interpretation, requires expert radiologists to manually identify and classify different tissue types. This process is time-consuming, subjective, and can vary between practitioners. Early detection of breast cancer is crucial for successful treatment, but manual analysis of ultrasound images poses several challenges:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-semibold text-white">Time-intensive analysis</span>: Manual segmentation and classification of breast ultrasound images requires significant time from trained specialists</li>
                  <li><span className="font-semibold text-white">Subjectivity and variability</span>: Different radiologists may interpret the same image differently, leading to inconsistent diagnoses</li>
                  <li><span className="font-semibold text-white">Class imbalance</span>: Medical datasets often have imbalanced classes (more normal/benign cases than malignant), making accurate classification challenging</li>
                  <li><span className="font-semibold text-white">Limited dataset size</span>: Medical imaging datasets are typically smaller than natural image datasets, requiring robust techniques to prevent overfitting</li>
                  <li><span className="font-semibold text-white">Complex tissue boundaries</span>: Distinguishing between benign and malignant tumors requires detecting subtle differences in texture, shape, and intensity patterns</li>
                  <li><span className="font-semibold text-white">Lack of accessible tools</span>: There are few user-friendly tools that allow non-experts to explore and understand medical image segmentation results</li>
                </ul>
                <p className="font-medium text-purple-200">
                  We wanted to create an automated, accurate, and accessible system that can assist medical professionals in breast ultrasound image analysis while providing clear, interpretable results through an interactive web interface.
                </p>
              </div>
            </section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="size-5 text-purple-400" aria-hidden="true" />
                Tech stack
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Core Framework</p>
                  <ul className="space-y-1.5">
                    {['PyTorch (Deep Learning)', 'Segmentation Models PyTorch', 'ResNet50 (Pre-trained)', 'U-Net Architecture'].map((tech) => (
                      <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="size-4 text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Image Processing</p>
                  <ul className="space-y-1.5">
                    {['OpenCV', 'Albumentations', 'NumPy', 'Pandas'].map((tech) => (
                      <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="size-4 text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Deployment</p>
                  <ul className="space-y-1.5">
                    {['Streamlit', 'TensorBoard', 'Python 3.8+'].map((tech) => (
                      <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="size-4 text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs text-neutral-400 italic">
                Chosen for production ML workflows, medical image analysis, and seamless deployment with zero infrastructure management.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Solution Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Zap className="size-6 text-purple-400" aria-hidden="true" />
            Solution
          </h2>

          {/* 7.1 Advanced Deep Learning Model */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.1 Advanced Deep Learning Model</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Implemented a <span className="font-semibold text-white">U-Net architecture</span> with a <span className="font-semibold text-white">ResNet50 encoder</span> pre-trained on ImageNet. The model was adapted for grayscale medical images and fine-tuned for multi-class segmentation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Architecture Components:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Encoder</span>: ResNet50 (pre-trained on ImageNet, adapted for grayscale)</li>
                    <li><span className="font-semibold text-white">Decoder</span>: U-Net with skip connections</li>
                    <li><span className="font-semibold text-white">Attention</span>: SCSE (Spatial and Channel Squeeze & Excitation)</li>
                    <li><span className="font-semibold text-white">Activation</span>: Softmax2d for multi-class segmentation</li>
                    <li><span className="font-semibold text-white">Output</span>: 3-channel probability maps (Background, Benign, Malignant)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Loss Function:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Combined Dice-Focal Loss</span></li>
                    <li>Dice Loss: Handles class imbalance effectively</li>
                    <li>Focal Loss: Focuses on hard examples</li>
                    <li>Class weights: Automatically calculated from dataset</li>
                    <li>Alpha: 0.5 (balances Dice and Focal loss)</li>
                    <li>Gamma: 2.0 (focal loss focus parameter)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7.2 Comprehensive Data Pipeline */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.2 Comprehensive Data Pipeline</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Built a robust data pipeline with custom PyTorch Dataset class, stratified splitting, and extensive data augmentation to handle the small medical imaging dataset.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Dataset Structure:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Custom PyTorch Dataset class for medical images</li>
                    <li>Stratified train/validation split (80/20)</li>
                    <li>Support for grayscale medical images</li>
                    <li>Automatic mask generation and multi-class encoding</li>
                    <li>BUSI dataset: 624 training pairs (355 benign, 167 malignant, 102 normal)</li>
                    <li>156 test images for evaluation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Data Augmentation (12+ techniques):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Geometric: Horizontal/Vertical flips, Rotation (30°), Shift/Scale/Rotate</li>
                    <li>Advanced: Elastic Transform, Grid Distortion, Optical Distortion</li>
                    <li>Photometric: Random Brightness/Contrast, Gaussian Blur, Random Gamma</li>
                    <li>Enhancement: CLAHE (Contrast Limited Adaptive Histogram Equalization)</li>
                    <li>All augmentations preserve mask alignment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7.3 Robust Training System */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.3 Robust Training System</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Training Configuration:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Batch size: 16</li>
                    <li>Image size: 256x256</li>
                    <li>Learning rate: 1e-4</li>
                    <li>Weight decay: 1e-5</li>
                    <li>Gradient clip norm: 1.0</li>
                    <li>Early stopping patience: 10 epochs</li>
                    <li>Maximum epochs: 50</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Optimization:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>AdamW optimizer with weight decay</li>
                    <li>OneCycleLR learning rate scheduler</li>
                    <li>Gradient clipping for stability</li>
                    <li>Early stopping with patience</li>
                    <li>TensorBoard logging for monitoring</li>
                    <li>Model checkpointing (saves best model)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7.4 Comprehensive Evaluation Metrics */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.4 Comprehensive Evaluation Metrics</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Implemented comprehensive evaluation metrics to assess model performance across all classes and provide detailed insights into segmentation quality.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Metrics Tracked:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Dice Score</span>: Per class and overall</li>
                    <li><span className="font-semibold text-white">Intersection over Union (IoU)</span>: Measures overlap</li>
                    <li><span className="font-semibold text-white">Precision and Recall</span>: Class-specific performance</li>
                    <li>Per-class performance tracking</li>
                    <li>Real-time training visualization</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Visualization:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>TensorBoard integration for training metrics</li>
                    <li>Loss curves (total, Dice, Focal)</li>
                    <li>Validation metrics over epochs</li>
                    <li>Segmentation overlays on test images</li>
                    <li>Confidence score distributions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7.5 Interactive Web Application */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.5 Interactive Web Application</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Built a clean, professional Streamlit web application that makes the segmentation model accessible to users with an intuitive interface.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Real-time image upload and processing</li>
                    <li>156 example images for instant testing</li>
                    <li>Visual segmentation overlays (color-coded)</li>
                    <li>Detailed statistics and probability distributions</li>
                    <li>Clear explanations and interpretations</li>
                    <li>Responsive design (mobile and desktop)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Technical Implementation:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Data caching with <code className="rounded bg-white/10 px-1.5 py-0.5 text-purple-300 text-xs">@st.cache_data</code></li>
                    <li>Efficient model loading and inference</li>
                    <li>Real-time prediction generation</li>
                    <li>Error handling and graceful degradation</li>
                    <li>Modular code structure</li>
                    <li>Type hints and documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7.6 Advanced Segmentation Algorithm */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.6 Advanced Segmentation Algorithm</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Implemented advanced computer vision techniques to enhance segmentation accuracy and provide realistic confidence scoring.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Multi-Feature Analysis:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Intensity analysis for tissue detection</li>
                    <li>Edge detection using Canny algorithm</li>
                    <li>Gradient magnitude analysis</li>
                    <li>Adaptive thresholding for better tissue detection</li>
                    <li>Morphological operations for shape refinement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Confidence Scoring:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Spatial probability variation analysis</li>
                    <li>Realistic confidence scores (70-95% for detected regions)</li>
                    <li>Color-coded visualization (green=benign, red=malignant)</li>
                    <li>Probability distribution charts</li>
                    <li>Clear tissue type boundaries</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7.7 Production-Ready Codebase */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.7 Production-Ready Codebase</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Designed a modular, maintainable codebase suitable for portfolio and production use.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Architecture:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Modular architecture (separate modules for dataset, model, training, inference)</li>
                    <li>Configuration-based design (easy to modify parameters)</li>
                    <li>Comprehensive error handling</li>
                    <li>Type hints and documentation</li>
                    <li>Clean code structure</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Project Structure:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-purple-300 text-xs">src/</code>: Core modules (config, dataset, model, metrics, train, inference)</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-purple-300 text-xs">demo/</code>: Streamlit web application</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-purple-300 text-xs">data/</code>: Training and test data</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-purple-300 text-xs">checkpoints/</code>: Saved model weights</li>
                    <li>Comprehensive README and deployment guides</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Architecture Diagram */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="size-6 text-purple-400" aria-hidden="true" />
            Architecture
          </h2>
          <div className="bg-white/5 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
              {`BUSI Dataset
624 image-mask pairs
(355 benign, 167 malignant, 102 normal)

    ↓

Data Preprocessing
- Grayscale normalization
- Multi-class mask encoding
- Stratified train/val split (80/20)

    ↓

Data Augmentation
(12+ techniques)
- Geometric: Flips, Rotation, Elastic Transform
- Photometric: Brightness, Contrast, CLAHE
- Advanced: Grid Distortion, Optical Distortion

    ↓

U-Net Model
- Encoder: ResNet50 (pre-trained on ImageNet)
- Decoder: U-Net with skip connections
- Attention: SCSE (Spatial and Channel)
- Activation: Softmax2d (3 classes)

    ↓

Training Pipeline
- Combined Dice-Focal Loss
- AdamW optimizer (lr=1e-4)
- OneCycleLR scheduler
- Gradient clipping
- Early stopping
- TensorBoard logging

    ↓

Model Inference
- Real-time prediction
- Multi-class probability maps
- Confidence scoring
- Color-coded visualization

    ↓

Streamlit Web App
- Image upload
- 156 example images
- Interactive visualization
- Statistics & probabilities
- Deployed on Streamlit Cloud`}
            </pre>
          </div>
        </motion.section>

        {/* Key Features Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="size-5 text-purple-400" aria-hidden="true" />
            Key Features & Capabilities
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Technical Implementation</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Multi-Class Segmentation</td>
                  <td className="py-3 px-4">Pixel-level classification of 3 tissue types</td>
                  <td className="py-3 px-4 text-sm">U-Net with 3-channel output, Softmax2d activation</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Transfer Learning</td>
                  <td className="py-3 px-4">Pre-trained ResNet50 encoder for feature extraction</td>
                  <td className="py-3 px-4 text-sm">ImageNet pre-trained weights, adapted for grayscale input</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Class Imbalance Handling</td>
                  <td className="py-3 px-4">Combined Dice-Focal loss with automatic class weights</td>
                  <td className="py-3 px-4 text-sm">Weighted loss function, class distribution analysis</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Data Augmentation</td>
                  <td className="py-3 px-4">12+ augmentation techniques for robustness</td>
                  <td className="py-3 px-4 text-sm">Albumentations library, geometric and photometric transforms</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Attention Mechanism</td>
                  <td className="py-3 px-4">SCSE attention for better feature learning</td>
                  <td className="py-3 px-4 text-sm">Spatial and Channel Squeeze & Excitation blocks</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Interactive Web Demo</td>
                  <td className="py-3 px-4">Real-time image processing and visualization</td>
                  <td className="py-3 px-4 text-sm">Streamlit app with 156 example images, color-coded overlays</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Comprehensive Metrics</td>
                  <td className="py-3 px-4">Dice score, IoU, Precision, Recall per class</td>
                  <td className="py-3 px-4 text-sm">Custom metrics module with per-class tracking</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Production Deployment</td>
                  <td className="py-3 px-4">Live web application on Streamlit Cloud</td>
                  <td className="py-3 px-4 text-sm">Automated deployment, zero infrastructure management</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Impact / Outcomes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="size-6 text-purple-400" aria-hidden="true" />
            Impact & Outcomes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Technical Achievements:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Successfully implemented</span> end-to-end deep learning pipeline for medical image segmentation</li>
                <li><span className="font-semibold text-white">Achieved</span> multi-class segmentation with clear distinction between tissue types (Background, Benign, Malignant)</li>
                <li><span className="font-semibold text-white">Built</span> production-ready web application with interactive interface</li>
                <li><span className="font-semibold text-white">Implemented</span> comprehensive data augmentation for better generalization</li>
                <li><span className="font-semibold text-white">Created</span> modular, maintainable codebase suitable for portfolio</li>
                <li><span className="font-semibold text-white">Deployed</span> live demo on Streamlit Cloud</li>
                <li><span className="font-semibold text-white">Designed</span> user-friendly interface with example images and clear explanations</li>
                <li><span className="font-semibold text-white">Implemented</span> advanced computer vision techniques for accurate segmentation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Real-World Application:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Medical AI</span>: Real-world application in healthcare domain for breast cancer detection</li>
                <li><span className="font-semibold text-white">Educational Value</span>: Demonstrates production ML engineering practices for medical imaging</li>
                <li><span className="font-semibold text-white">Accessibility</span>: Makes complex ML predictions accessible to non-technical users</li>
                <li><span className="font-semibold text-white">Research Contribution</span>: Validated deep learning techniques for medical image segmentation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Learning Outcomes:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li>Deep learning for medical image analysis</li>
                <li>Transfer learning with pre-trained models</li>
                <li>Multi-class image segmentation</li>
                <li>Data augmentation strategies</li>
                <li>Model training and evaluation</li>
                <li>Web application development with Streamlit</li>
                <li>Deployment and hosting</li>
                <li>User interface design</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Technical Challenges Solved */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Shield className="size-6 text-purple-400" aria-hidden="true" />
            Technical Challenges Solved
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Class Imbalance',
                solution: 'Used weighted loss functions (Dice-Focal) and automatic class weight calculation to handle imbalanced medical dataset',
              },
              {
                title: 'Small Dataset',
                solution: 'Extensive data augmentation (12+ techniques) to increase effective dataset size and improve generalization',
              },
              {
                title: 'Medical Image Quality',
                solution: 'Preprocessing and normalization techniques, CLAHE enhancement, and grayscale adaptation for medical images',
              },
              {
                title: 'Multi-class Segmentation',
                solution: 'Proper encoding (3 classes), combined loss function design, and per-class evaluation metrics',
              },
              {
                title: 'Model Deployment',
                solution: 'Streamlit web application with efficient model loading, caching, and real-time inference',
              },
              {
                title: 'User Experience',
                solution: 'Interactive interface with 156 example images, color-coded visualizations, and clear explanations',
              },
            ].map((challenge, index) => (
              <motion.div
                key={challenge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{challenge.title}</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">{challenge.solution}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Deployment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="size-5 text-purple-400" aria-hidden="true" />
            Deployment
          </h2>
          <div className="space-y-4 text-neutral-300">
            <div>
              <p className="font-semibold text-white mb-2">Platform:</p>
              <p>Streamlit Community Cloud</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Status:</p>
              <p>Live and accessible</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">URL:</p>
              <a
                href="https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 underline"
              >
                https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app
              </a>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Features:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Real-time image processing</li>
                <li>156 example images</li>
                <li>Interactive segmentation visualization</li>
                <li>Detailed statistics and probabilities</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-purple-400/20 bg-purple-500/5 p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-3">OncoVision</h3>
          <p className="text-sm text-neutral-300 mb-2">
            A deep learning case study demonstrating production-level medical image segmentation, transfer learning, and full-stack deployment.
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            Built with PyTorch, U-Net, ResNet50, and Streamlit. Deployed on Streamlit Community Cloud. Open source and available for educational purposes.
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            This project showcases end-to-end ML engineering for medical AI: from data preprocessing and augmentation through model training, evaluation, and production deployment. It demonstrates how deep learning, computer vision, and user interface design combine to create accurate, explainable, and accessible medical image analysis systems.
          </p>
          <p className="text-xs text-neutral-600 mt-4 italic">
            Note: This project is for educational purposes and is not intended for clinical use. Medical diagnosis should always be performed by qualified healthcare professionals.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/25"
            >
              <Zap className="size-4" />
              Live Demo
            </a>
            <a
              href="https://github.com/HarshithKeshavamurthy17/OncoVision"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              <Code className="size-4" />
              View Source
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


