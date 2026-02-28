import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FlaskConical, Map, BarChart2, BookOpen, ChevronDown, ChevronUp, ExternalLink, Zap, TreePine, Globe, ArrowUpCircle } from 'lucide-react';
import ReviewSection from './components/ReviewSection';

// Research project data (Kenya Butterfly Urban Adaptation Study)
const STUDY_STATS = [
    { label: 'Total Records', value: '3,193', color: '#00a84f' },
    { label: 'Species', value: '9', color: '#c41e3a' },
    { label: 'Counties', value: '47', color: '#1e293b' },
    { label: 'AUC Score', value: '0.606', color: '#00a84f' }
];

const FIGURES = [
    { src: '/research-assets/Figure1_abundance.png', title: 'Figure 1: Species Abundance', caption: 'Butterfly species abundance in Kenya based on GBIF records (2000–2024). Papilio demodocus (n=664) was the most abundant.' },
    { src: '/research-assets/Figure2_study_area.png', title: 'Figure 2: Study Area', caption: 'Study area showing five major urban centers (red, 15km buffers) and five protected areas (green, 30km buffers) in Kenya.' },
    { src: '/research-assets/Figure3_occurrence_map.png', title: 'Figure 3: Occurrence Map', caption: 'Spatial distribution of 3,193 butterfly occurrence records across Kenya, colored by species. Data: GBIF (2000–2024).' },
    { src: '/research-assets/Figure4_SDM.png', title: 'Figure 4: Species Distribution Model', caption: "Habitat suitability model for Junonia oenone. Warmer colors indicate higher suitability. AUC = 0.606." },
    { src: '/research-assets/Figure5_var_importance.png', title: 'Figure 5: Variable Importance', caption: 'Variable importance for Junonia oenone SDM. Elevation was the strongest predictor, followed by temperature.' },
    { src: '/research-assets/Figure6_response_curves.png', title: 'Figure 6: Response Curves', caption: 'Response curves showing relationship between environmental variables and habitat suitability.' },
    { src: '/research-assets/Figure7_urban_vs_protected.png', title: 'Figure 7: Urban vs Protected Areas', caption: 'Species composition comparison between urban and protected areas. Papilio demodocus dominates urban sites.' }
];

const KEY_FINDINGS = [
    { icon: <Zap size={20} />, title: 'Urban Adapters', text: 'Papilio demodocus (45%) and Danaus chrysippus (28%) dominate urban areas, showing adaptation to human-modified landscapes.' },
    { icon: <TreePine size={20} />, title: 'Forest Specialists', text: 'Charaxes brutus shows strong association with protected areas (62% of observations), indicating sensitivity to habitat modification.' },
    { icon: <Globe size={20} />, title: 'Generalist Species', text: 'Junonia oenone exhibits broad environmental tolerance (AUC = 0.606), occurring across wide elevational and climatic gradients.' },
    { icon: <ArrowUpCircle size={20} />, title: 'Elevation Preference', text: 'Peak occurrence in mid-elevations (500–1500m: 42%), with 31% in lowlands and 27% in highlands.' }
];

const SPECIES_TABLE = [
    { name: 'Papilio demodocus', common: 'Citrus Swallowtail', records: 664, pct: '20.8%' },
    { name: 'Catopsilia florella', common: 'African Migrant', records: 472, pct: '14.8%' },
    { name: 'Danaus chrysippus', common: 'African Monarch', records: 446, pct: '14.0%' },
    { name: 'Junonia oenone', common: 'Dark Blue Pansy', records: 438, pct: '13.7%' },
    { name: 'Hypolimnas misippus', common: 'Diadem', records: 409, pct: '12.8%' },
    { name: 'Belenois aurota', common: 'Brown-veined White', records: 265, pct: '8.3%' },
    { name: 'Eurema hecabe', common: 'Common Grass Yellow', records: 59, pct: '1.8%' },
    { name: 'Charaxes brutus', common: 'White-barred Charaxes', records: 54, pct: '1.7%' },
    { name: 'Acraea acrita', common: 'Fiery Acraea', records: 0, pct: '0%' }
];

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#00a84f]/10 rounded-lg flex items-center justify-center text-[#00a84f]">{icon}</div>
        <h2 className="text-2xl font-bold text-[#1e293b] border-b-2 border-[#00a84f] pb-1">{title}</h2>
    </div>
);

const ResearchPage = () => {
    const [expandedFigure, setExpandedFigure] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.getProjects();
                // Filter to only show published projects
                setProjects(data.filter(p => p.status === 'published'));
            } catch (error) {
                console.error('Failed to fetch projects', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Create a fallback study if none exist, or use the first DB project as featured
    const featuredProject = projects.length > 0 ? projects[0] : {
        id: 9001,
        title: 'Kenya Butterfly Urban Adaptation Study',
        category: 'Spatial Ecology',
        datePublished: '2026-02-01',
        abstract: 'Biodiversity monitoring in tropical regions remains challenging due to limited systematic surveys. This study harnesses GBIF data to assess urban adaptation patterns of butterflies in Kenya.',
        authors: 'Daniel Manyasa',
        documentUrl: '/research-assets/Figure1_abundance.pdf', // Link to a primary asset
        thumbnail: '/research-assets/Figure3_occurrence_map.png',
        isDefault: true
    };

    const remainingProjects = projects.slice(1);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 pt-16 container mx-auto px-4 max-w-5xl">
                <div className="flex gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        <div className="h-32 bg-gray-200 rounded w-full animate-pulse mt-6"></div>
                    </div>
                    <div className="w-1/3 aspect-[3/4] bg-gray-200 rounded-xl animate-pulse hidden md:block"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in bg-gray-50 min-h-screen pb-20">
            <Helmet>
                <title>Let Us Know Kenya | Research & Publications</title>
                <meta name="description" content="Explore academic research, studies, and open access papers about Kenya's biodiversity, ecology, and resources." />
                <meta property="og:title" content="LUK Kenya Research Hub" />
                <meta property="og:description" content="Explore academic research, studies, and open access papers about Kenya's biodiversity, ecology, and resources." />
                <meta property="og:type" content="article" />
            </Helmet>

            {/* Hero / Featured Study */}
            <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-bl-full -mr-10 -mt-10"></div>
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#00a84f] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Featured Study
                        </span>
                        <span className="text-white/60 text-sm flex items-center gap-1">
                            <BookOpen size={14} /> {featuredProject.category}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
                                {featuredProject.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-6">
                                {featuredProject.authors && (
                                    <span className="flex items-center gap-1.5"><Map size={14} /> {featuredProject.authors}</span>
                                )}
                                <span className="flex items-center gap-1.5"><BarChart2 size={14} /> {new Date(featuredProject.datePublished).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>

                            <p className="text-white/90 text-lg leading-relaxed max-w-3xl mb-8">
                                {featuredProject.isDefault ? featuredProject.abstract : featuredProject.abstract.substring(0, 300) + '...'}
                            </p>

                            <div className="flex gap-4">
                                {featuredProject.documentUrl && (
                                    <a
                                        href={featuredProject.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn bg-[#00a84f] text-white hover:bg-[#008a42] border-none"
                                    >
                                        <ExternalLink size={18} />
                                        Read Full Paper
                                    </a>
                                )}
                                <button
                                    onClick={() => alert(`Cite this: ${featuredProject.authors || 'Author'}. (${new Date(featuredProject.datePublished).getFullYear()}). ${featuredProject.title}. LUK Kenya Research.`)}
                                    className="btn bg-white/10 text-white hover:bg-white/20 border-none backdrop-blur-sm"
                                >
                                    <BookOpen size={18} />
                                    Generate Citation
                                </button>
                            </div>
                        </div>

                        {featuredProject.thumbnail && (
                            <div className="w-full md:w-1/3 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl relative group">
                                <img
                                    src={featuredProject.thumbnail}
                                    alt={featuredProject.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <span className="text-white font-medium text-sm">Cover Figure</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Render the detailed Butterfly content ONLY if it's the default/fallback project */}
            {featuredProject.isDefault && (
                <>
                    {/* Stats */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="container mx-auto px-4 max-w-5xl">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
                                {STUDY_STATS.map(s => (
                                    <div key={s.label} className="text-center group">
                                        <div className="text-3xl font-bold transition-transform group-hover:scale-110" style={{ color: s.color }}>{s.value}</div>
                                        <div className="text-gray-500 text-sm mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
                        {/* Abstract */}
                        <section>
                            <SectionHeader icon={<BookOpen size={18} />} title="Abstract" />
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4 text-gray-700 leading-relaxed hover:shadow-md transition-shadow">
                                <p>We compiled <strong>3,193 butterfly occurrence records</strong> across nine species from 2000–2024, with <em>Junonia oenone</em> (n=438) being the most abundant. Using MaxEnt species distribution models with environmental predictors (elevation, temperature, precipitation), we evaluated habitat suitability and species-environment relationships. Our models achieved moderate predictive performance (AUC = 0.606), suggesting <em>J. oenone</em> exhibits generalist habitat preferences with weak environmental specialization.</p>
                                <p>Urban areas contained <strong>12.3%</strong> of observations, while protected areas harbored <strong>8.7%</strong>, suggesting butterflies readily adapt to human-modified landscapes. Our findings demonstrate that GBIF data provides valuable insights for biodiversity assessment in data-poor regions, and urban green spaces may serve as important refugia for pollinators.</p>
                                <p className="text-sm text-gray-500"><strong>Keywords:</strong> Species distribution models, MaxEnt, urban ecology, butterflies, Kenya, GBIF, conservation planning</p>
                            </div>
                        </section>

                        {/* Key Findings */}
                        <section>
                            <SectionHeader icon={<BarChart2 size={18} />} title="Key Findings" />
                            <div className="grid md:grid-cols-2 gap-4">
                                {KEY_FINDINGS.map(f => (
                                    <div key={f.title} className="bg-white rounded-xl p-5 border-l-4 border-[#00a84f] shadow-sm hover:-translate-y-1 transition-transform cursor-default">
                                        <h3 className="font-bold text-[#1e293b] mb-2 text-lg flex items-center gap-2">
                                            <span className="text-[#00a84f]">{f.icon}</span> {f.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: f.text.replace(/([A-Z][a-z]+ [a-z]+)/g, '<em>$1</em>') }} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Figures */}
                        <section>
                            <SectionHeader icon={<Map size={18} />} title="Figures" />
                            <div className="grid md:grid-cols-2 gap-6">
                                {FIGURES.map((fig, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div
                                            className="relative cursor-pointer group"
                                            onClick={() => setExpandedFigure(expandedFigure === i ? null : i)}
                                        >
                                            <img
                                                src={fig.src}
                                                alt={fig.title}
                                                className={`w-full object-cover group-hover:opacity-90 transition-all duration-300 ${expandedFigure === i ? 'h-auto' : 'h-56'}`}
                                                onError={e => { e.target.style.display = 'none' }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                    {expandedFigure === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white relative z-10">
                                            <h4 className="font-bold text-[#1e293b] text-sm mb-1">{fig.title}</h4>
                                            {expandedFigure === i && (
                                                <p className="text-gray-600 text-sm leading-relaxed mt-2 animate-fade-in border-t border-gray-100 pt-2">
                                                    {fig.caption}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </>
            )}

            {/* Other Projects Grid */}
            {remainingProjects.length > 0 && (
                <div className="container mx-auto px-4 py-16 max-w-5xl">
                    <SectionHeader icon={<FlaskConical size={18} />} title="Recent Academic Publications" />
                    <div className="grid md:grid-cols-2 gap-6">
                        {remainingProjects.map(project => (
                            <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden group">
                                {project.thumbnail && (
                                    <div className="h-48 overflow-hidden bg-gray-100">
                                        <img
                                            src={project.thumbnail}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-bold text-[#00a84f] bg-[#00a84f]/10 px-2.5 py-1 rounded-full">
                                            {project.category}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(project.datePublished).getFullYear()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xl text-[#1e293b] leading-tight mb-2 group-hover:text-[#c41e3a] transition-colors">{project.title}</h3>
                                    {project.authors && <p className="text-sm text-gray-500 mb-4">{project.authors}</p>}
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                        {project.abstract}
                                    </p>

                                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                                        {project.documentUrl && (
                                            <a
                                                href={project.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center py-2 px-4 bg-gray-50 hover:bg-gray-100 text-[#1e293b] text-sm font-semibold rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink size={14} /> PDF
                                            </a>
                                        )}
                                        <button
                                            onClick={() => alert(`Cite this: ${project.authors || 'Author'}. (${new Date(project.datePublished).getFullYear()}). ${project.title}. LUK Kenya Research.`)}
                                            className="flex-1 py-2 px-4 bg-white hover:bg-gray-50 text-[#00a84f] text-sm font-semibold rounded-lg transition-colors border border-[#00a84f]/30 flex items-center justify-center gap-2"
                                        >
                                            <BookOpen size={14} /> Cite
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Section */}
            <div className="container mx-auto px-4 max-w-5xl mt-8">
                <ReviewSection entityType="project" entityId={featuredProject.id || 9001} />
            </div>
        </div>
    );
};

export default ResearchPage;
